const { query } = require('../config/database');

class Question {
  // Create new question
    static async create({
  categoryId,
  questionAr,
  questionEn,
  answerAr,
  answerEn,
  points = 200,
  difficulty = 'easy',
  imageUrl = '',
  answerImageUrl = ''
}) {
  const sql = `
    INSERT INTO questions 
    (
      category_id,
      question_ar,
      question_en,
      answer_ar,
      answer_en,
      points,
      difficulty,
      image_url,
      answer_image_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Number(categoryId),
    questionAr || '',
    questionEn || '',
    answerAr || '',
    answerEn || '',
    Number(points),
    difficulty,
    imageUrl || null,
    answerImageUrl || null
  ];

  const result = await query(sql, values);

  return result.insertId;
}
  // Find question by ID
  static async findById(id) {
    const questions = await query(
      `SELECT q.*, c.name_ar as category_name_ar, c.name_en as category_name_en
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       WHERE q.id = ?`,
      [id]
    );
    return questions[0] || null;
  }

  // Get all questions (with optional filters)
  static async getAll({ 
    categoryId = null, 
    difficulty = null, 
    points = null, 
    isActive = true,
    search = '',
    page = 1,
    limit = 50
  } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (isActive !== null) {
      whereClause += ' AND q.is_active = ?';
      params.push(isActive);
    }

    if (categoryId) {
      whereClause += ' AND q.category_id = ?';
      params.push(categoryId);
    }

    if (difficulty) {
      whereClause += ' AND q.difficulty = ?';
      params.push(difficulty);
    }

    if (points) {
      whereClause += ' AND q.points = ?';
      params.push(points);
    }

    if (search) {
      whereClause += ' AND (q.question_ar LIKE ? OR q.question_en LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const questions = await query(
      `SELECT q.*, c.name_ar as category_name_ar, c.name_en as category_name_en
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       ${whereClause}
       ORDER BY q.category_id, q.points
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await query(
      `SELECT COUNT(*) as total 
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       ${whereClause}`,
      params
    );

    return {
      questions,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  }

  // Get questions by category
  static async getByCategory(categoryId, { isActive = true } = {}) {
    return await query(
      `SELECT * FROM questions 
       WHERE category_id = ? AND is_active = ?
       ORDER BY points, id`,
      [categoryId, isActive]
    );
  }

  // Get questions by category and points
  static async getByCategoryAndPoints(categoryId, points) {
    return await query(
      `SELECT * FROM questions 
       WHERE category_id = ? AND points = ? AND is_active = TRUE
       ORDER BY RAND()`,
      [categoryId, points]
    );
  }

  // Get random questions for game
  static async getRandomForGame(categoryIds, questionsPerCategory = 6) {
    const questions = [];
    
    for (const categoryId of categoryIds) {
      // Get 2 questions for each point value (200, 400, 600)
      const pointValues = [200, 400, 600];
      
      for (const points of pointValues) {
        const categoryQuestions = await query(
          `SELECT q.*, c.name_ar as category_name_ar, c.name_en as category_name_en,
                  c.image_url as category_image
           FROM questions q
           JOIN categories c ON q.category_id = c.id
           WHERE q.category_id = ? AND q.points = ? AND q.is_active = TRUE
           ORDER BY RAND()
           LIMIT 2`,
          [categoryId, points]
        );
        
        questions.push(...categoryQuestions);
      }
    }
    
    return questions;
  }

  // Update question
  static async update(id, updates) {
    const fieldMap = {
      categoryId: 'category_id',
      questionAr: 'question_ar',
      questionEn: 'question_en',
      answerAr: 'answer_ar',
      answerEn: 'answer_en',
      points: 'points',
      difficulty: 'difficulty',
      imageUrl: 'image_url',
      answerImageUrl: 'answer_image_url',
      isActive: 'is_active'
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
      `UPDATE questions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  // Delete question
  static async delete(id) {
    await query('DELETE FROM questions WHERE id = ?', [id]);
    return true;
  }

  // Toggle active status
  static async toggleActive(id) {
    await query(
      `UPDATE questions SET is_active = NOT is_active WHERE id = ?`,
      [id]
    );
    return true;
  }

  // Get question statistics
  static async getStats() {
    return await query(
      `SELECT 
        c.name_ar as category_name,
        COUNT(*) as total_questions,
        SUM(CASE WHEN q.points = 200 THEN 1 ELSE 0 END) as easy_count,
        SUM(CASE WHEN q.points = 400 THEN 1 ELSE 0 END) as medium_count,
        SUM(CASE WHEN q.points = 600 THEN 1 ELSE 0 END) as hard_count,
        SUM(CASE WHEN q.is_active = TRUE THEN 1 ELSE 0 END) as active_count
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       GROUP BY q.category_id`
    );
  }

  // Import multiple questions
  static async importMany(questions) {
    const results = [];
    
    for (const q of questions) {
      try {
        const id = await this.create(q);
        results.push({ success: true, id });
      } catch (error) {
        results.push({ success: false, error: error.message, question: q });
      }
    }
    
    return results;
  }
}

module.exports = Question;
