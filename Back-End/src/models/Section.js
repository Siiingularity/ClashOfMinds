const { query } = require('../config/database');

class Section {
  // Create new section
  static async create({ nameAr, nameEn, slug, displayOrder = 0 }) {
    const result = await query(
      `INSERT INTO sections (name_ar, name_en, slug, display_order)
       VALUES (?, ?, ?, ?)`,
      [nameAr, nameEn, slug, displayOrder]
    );
    return result.insertId;
  }

  // Find by ID
  static async findById(id) {
    const rows = await query(
      `SELECT s.*, COUNT(c.id) AS category_count
       FROM sections s
       LEFT JOIN categories c ON c.section = s.slug AND c.is_active = TRUE
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );
    return rows[0] || null;
  }

  // Find by slug
  static async findBySlug(slug) {
    const rows = await query(
      'SELECT * FROM sections WHERE slug = ?',
      [slug]
    );
    return rows[0] || null;
  }

  // Get all sections (with category count)
  static async getAll({ includeInactive = false } = {}) {
    const where = includeInactive ? '' : 'WHERE s.is_active = TRUE';
    return query(
      `SELECT s.*, COUNT(c.id) AS category_count
       FROM sections s
       LEFT JOIN categories c ON c.section = s.slug AND c.is_active = TRUE
       ${where}
       GROUP BY s.id
       ORDER BY s.display_order ASC, s.name_ar ASC`
    );
  }

  // Update section
  static async update(id, { nameAr, nameEn, newSlug, displayOrder, isActive }) {
    // If slug is changing → update all categories that use the old slug
    if (newSlug !== undefined) {
      const current = await this.findById(id);
      if (current && current.slug !== newSlug) {
        await query(
          'UPDATE categories SET section = ? WHERE section = ?',
          [newSlug, current.slug]
        );
      }
    }

    const fieldMap = {
      nameAr:       'name_ar',
      nameEn:       'name_en',
      newSlug:      'slug',
      displayOrder: 'display_order',
      isActive:     'is_active',
    };

    const fields = [];
    const values = [];

    for (const [key, col] of Object.entries(fieldMap)) {
      const arg = { nameAr, nameEn, newSlug, displayOrder, isActive }[key];
      if (arg !== undefined) {
        fields.push(`${col} = ?`);
        values.push(arg);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    await query(
      `UPDATE sections SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  // Delete section — blocks if categories are still using it
  static async delete(id) {
    const section = await this.findById(id);
    if (!section) return { deleted: false, reason: 'not_found' };

    // Count ALL categories (including inactive) using this slug
    const [{ total }] = await query(
      'SELECT COUNT(*) AS total FROM categories WHERE section = ?',
      [section.slug]
    );

    if (total > 0) {
      return { deleted: false, reason: 'has_categories', count: total };
    }

    await query('DELETE FROM sections WHERE id = ?', [id]);
    return { deleted: true };
  }

  // Force-delete: reassign categories to another section first
  static async forceDelete(id, reassignToSlug = null) {
    const section = await this.findById(id);
    if (!section) return false;

    if (reassignToSlug) {
      await query(
        'UPDATE categories SET section = ? WHERE section = ?',
        [reassignToSlug, section.slug]
      );
    } else {
      // Deactivate orphaned categories
      await query(
        'UPDATE categories SET is_active = FALSE WHERE section = ?',
        [section.slug]
      );
    }

    await query('DELETE FROM sections WHERE id = ?', [id]);
    return true;
  }

  // Toggle active status
  static async toggleActive(id) {
    await query(
      'UPDATE sections SET is_active = NOT is_active WHERE id = ?',
      [id]
    );
    return true;
  }

  // Check slug uniqueness (for validation)
  static async slugExists(slug, excludeId = null) {
    let sql = 'SELECT id FROM sections WHERE slug = ?';
    const params = [slug];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    const rows = await query(sql, params);
    return rows.length > 0;
  }
}

module.exports = Section;
