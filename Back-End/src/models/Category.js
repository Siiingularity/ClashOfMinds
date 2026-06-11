const { query } = require('../config/database');

class Category {
  // Create new category
  static async create({ nameAr, nameEn, descriptionAr, descriptionEn, section, imageUrl, questionCount = 6 }) {
    const result = await query(
      `INSERT INTO categories (name_ar, name_en, description_ar, description_en, section, image_url, question_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nameAr,
        nameEn,
        descriptionAr ?? '',
        descriptionEn ?? '',
        section,
        imageUrl ?? 'question',
        questionCount ?? 6
      ]
    );
    return result.insertId;
  }

  // Find category by ID
  static async findById(id) {
    const categories = await query(
      `SELECT c.*, COUNT(q.id) as actual_question_count 
       FROM categories c 
       LEFT JOIN questions q ON c.id = q.category_id AND q.is_active = TRUE
       WHERE c.id = ? 
       GROUP BY c.id`,
      [id]
    );
    return categories[0] || null;
  }

  // Get all categories (with optional filters)
  static async getAll({ section = null, isActive = true, search = '' } = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (isActive !== null) {
      whereClause += ' AND c.is_active = ?';
      params.push(isActive);
    }

    if (section) {
      whereClause += ' AND c.section = ?';
      params.push(section);
    }

    if (search) {
      whereClause += ' AND (c.name_ar LIKE ? OR c.name_en LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    return await query(
      `SELECT c.*, COUNT(q.id) as actual_question_count 
       FROM categories c 
       LEFT JOIN questions q ON c.id = q.category_id AND q.is_active = TRUE
       ${whereClause} 
       GROUP BY c.id
       ORDER BY c.section, c.name_ar`,
      params
    );
  }

  // Get categories by section
  static async getBySection(section) {
    return await query(
      `SELECT c.*, COUNT(q.id) as question_count 
       FROM categories c 
       LEFT JOIN questions q ON c.id = q.category_id AND q.is_active = TRUE
       WHERE c.section = ? AND c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.name_ar`,
      [section]
    );
  }

  // Get all sections with their categories
  static async getAllWithSections() {
    const categories = await this.getAll({ isActive: true });
    
    const grouped = {};
    categories.forEach(cat => {
      if (!grouped[cat.section]) {
        grouped[cat.section] = [];
      }
      grouped[cat.section].push(cat);
    });

    return grouped;
  }

  // Update category
  static async update(id, updates) {
    const fieldMap = {
      nameAr: 'name_ar',
      nameEn: 'name_en',
      descriptionAr: 'description_ar',
      descriptionEn: 'description_en',
      section: 'section',
      imageUrl: 'image_url',
      isActive: 'is_active',
      questionCount: 'question_count'
    };

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    await query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  // Delete category
  static async delete(id) {
    await query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }

  // Toggle active status
  static async toggleActive(id) {
    await query(
      `UPDATE categories SET is_active = NOT is_active WHERE id = ?`,
      [id]
    );
    return true;
  }

  // Get random categories for game
  static async getRandomForGame(count = 6) {
    return await query(
      `SELECT c.*, COUNT(q.id) as question_count 
       FROM categories c 
       LEFT JOIN questions q ON c.id = q.category_id AND q.is_active = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       HAVING question_count >= 6
       ORDER BY RAND()
       LIMIT ?`,
      [count]
    );
  }

  // Get category statistics
  static async getStats() {
    return await query(
      `SELECT 
        section,
        COUNT(*) as category_count,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
       FROM categories
       GROUP BY section`
    );
  }
}

module.exports = Category;
