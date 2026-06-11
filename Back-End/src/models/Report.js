const { query } = require('../config/database');

class Report {
  static async create({ userId, questionId, categoryId, description, username, email }) {
    const result = await query(
      `INSERT INTO reports (user_id, question_id, category_id, description, username, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, questionId || null, categoryId || null, description, username || null, email || null]
    );
    return result.insertId;
  }

  static async getAll({ status } = {}) {
    const where = status ? `WHERE status = ?` : '';
    const params = status ? [status] : [];
    return query(
      `SELECT r.*, u.username
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );
  }

  static async updateStatus(id, status) {
    await query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
  }
}

module.exports = Report;
