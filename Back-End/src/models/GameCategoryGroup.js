const { query } = require('../config/database');

class GameCategoryGroup {
  // Add a category group to a game session
  static async create({ gameSessionId, categoryId, questionGroupId }) {
    const result = await query(
      `INSERT INTO game_category_groups (game_session_id, category_id, question_group_id)
       VALUES (?, ?, ?)`,
      [gameSessionId, categoryId, questionGroupId]
    );
    return result.insertId;
  }

  // Bulk insert multiple category groups for a session
  static async bulkCreate(gameSessionId, groups) {
    if (!groups || groups.length === 0) return [];

    const values = groups.map((g) => [gameSessionId, g.categoryId, g.questionGroupId]);
    const placeholders = values.map(() => '(?, ?, ?)').join(', ');
    const flat = values.flat();

    const result = await query(
      `INSERT INTO game_category_groups (game_session_id, category_id, question_group_id)
       VALUES ${placeholders}`,
      flat
    );
    return result.insertId;
  }

  // Get all category groups for a game session (with category details)
  static async findBySession(gameSessionId) {
    return query(
      `SELECT gcg.*,
              c.name_ar   AS category_name_ar,
              c.name_en   AS category_name_en,
              c.section   AS category_section,
              c.image_url AS category_image_url
       FROM game_category_groups gcg
       LEFT JOIN categories c ON gcg.category_id = c.id
       WHERE gcg.game_session_id = ?
       ORDER BY gcg.created_at ASC`,
      [gameSessionId]
    );
  }

  // Get a single record by id
  static async findById(id) {
    const rows = await query(
      `SELECT gcg.*,
              c.name_ar   AS category_name_ar,
              c.name_en   AS category_name_en,
              c.section   AS category_section
       FROM game_category_groups gcg
       LEFT JOIN categories c ON gcg.category_id = c.id
       WHERE gcg.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Update a single record
  static async update(id, { categoryId, questionGroupId }) {
    const fields = [];
    const params = [];

    if (categoryId !== undefined) {
      fields.push('category_id = ?');
      params.push(categoryId);
    }
    if (questionGroupId !== undefined) {
      fields.push('question_group_id = ?');
      params.push(questionGroupId);
    }

    if (fields.length === 0) return false;

    params.push(id);
    await query(
      `UPDATE game_category_groups SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return true;
  }

  // Delete a single record
  static async delete(id) {
    const result = await query(
      'DELETE FROM game_category_groups WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Delete ALL category groups for a session (reset)
  static async deleteBySession(gameSessionId) {
    const result = await query(
      'DELETE FROM game_category_groups WHERE game_session_id = ?',
      [gameSessionId]
    );
    return result.affectedRows;
  }

  // Check if a category is already assigned to a session
  static async existsInSession(gameSessionId, categoryId) {
    const rows = await query(
      'SELECT id FROM game_category_groups WHERE game_session_id = ? AND category_id = ?',
      [gameSessionId, categoryId]
    );
    return rows.length > 0;
  }
}

module.exports = GameCategoryGroup;
