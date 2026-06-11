const { query, transaction } = require('../config/database');

class GameSession {
  // Create new game session
  static async create({ sessionName, team1Name, team2Name, createdBy = null }) {
    const result = await query(
      `INSERT INTO game_sessions (session_name, team1_name, team2_name, created_by) 
       VALUES (?, ?, ?, ?)`,
      [sessionName, team1Name, team2Name, createdBy]
    );
    return result.insertId;
  }

  // Find session by ID
  static async findById(id) {
    const sessions = await query(
      `SELECT gs.*, u.username as created_by_username
       FROM game_sessions gs
       LEFT JOIN users u ON gs.created_by = u.id
       WHERE gs.id = ?`,
      [id]
    );
    return sessions[0] || null;
  }

  // Get all sessions (with optional filters)
  static async getAll({ 
    status = null, 
    createdBy = null,
    page = 1,
    limit = 20
  } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND gs.status = ?';
      params.push(status);
    }

    if (createdBy) {
      whereClause += ' AND gs.created_by = ?';
      params.push(createdBy);
    }

    const sessions = await query(
      `SELECT gs.*, u.username as created_by_username,
              COUNT(gq.id) as questions_asked
       FROM game_sessions gs
       LEFT JOIN users u ON gs.created_by = u.id
       LEFT JOIN game_questions gq ON gs.id = gq.game_session_id
       ${whereClause}
       GROUP BY gs.id
       ORDER BY gs.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await query(
      `SELECT COUNT(*) as total 
       FROM game_sessions gs
       ${whereClause}`,
      params
    );

    return {
      sessions,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  }

  // Update session scores
  static async updateScores(id, { team1Score, team2Score, winner = null }) {
    const updates = [];
    const values = [];

    if (team1Score !== undefined) {
      updates.push('team1_score = ?');
      values.push(team1Score);
    }

    if (team2Score !== undefined) {
      updates.push('team2_score = ?');
      values.push(team2Score);
    }

    if (winner !== undefined) {
      updates.push('winner = ?');
      values.push(winner);
    }

    if (updates.length === 0) return false;

    values.push(id);
    await query(
      `UPDATE game_sessions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  // End game session
  static async end(id, winner) {
    await query(
      `UPDATE game_sessions 
       SET status = 'completed', winner = ?, ended_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [winner, id]
    );
    return true;
  }

  // Abandon game session
  static async abandon(id) {
    await query(
      `UPDATE game_sessions 
       SET status = 'abandoned', ended_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    );
    return true;
  }

  // Delete session
  static async delete(id) {
    return await transaction(async (connection) => {
      // Delete related game questions first
      await connection.execute(
        'DELETE FROM game_questions WHERE game_session_id = ?',
        [id]
      );
      
      // Delete session
      await connection.execute(
        'DELETE FROM game_sessions WHERE id = ?',
        [id]
      );
      
      return true;
    });
  }

  // Record a question being asked
  static async recordQuestion({ sessionId, questionId, askedByTeam, answeredByTeam = null, isCorrect = null, pointsEarned = 0 }) {
    const result = await query(
      `INSERT INTO game_questions (game_session_id, question_id, asked_by_team, answered_by_team, is_correct, points_earned) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, questionId, askedByTeam, answeredByTeam, isCorrect, pointsEarned]
    );
    return result.insertId;
  }

  // Get session questions
  static async getSessionQuestions(sessionId) {
    return await query(
      `SELECT gq.*, q.question_ar, q.question_en, q.answer_ar, q.answer_en, q.points,
              c.name_ar as category_name_ar, c.name_en as category_name_en
       FROM game_questions gq
       JOIN questions q ON gq.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       WHERE gq.game_session_id = ?
       ORDER BY gq.asked_at`,
      [sessionId]
    );
  }

  // Get session statistics
  static async getStats(sessionId) {
    const stats = await query(
      `SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN answered_by_team = 1 THEN 1 ELSE 0 END) as team1_answers,
        SUM(CASE WHEN answered_by_team = 2 THEN 1 ELSE 0 END) as team2_answers,
        SUM(CASE WHEN is_correct = TRUE AND answered_by_team = 1 THEN points_earned ELSE 0 END) as team1_correct_points,
        SUM(CASE WHEN is_correct = TRUE AND answered_by_team = 2 THEN points_earned ELSE 0 END) as team2_correct_points
       FROM game_questions
       WHERE game_session_id = ?`,
      [sessionId]
    );
    return stats[0];
  }

  // Get leaderboard
  static async getLeaderboard(limit = 10) {
    return await query(
      `SELECT 
        winner,
        COUNT(*) as wins,
        AVG(team1_score + team2_score) as avg_total_score
       FROM game_sessions
       WHERE status = 'completed' AND winner IS NOT NULL
       GROUP BY winner
       ORDER BY wins DESC
       LIMIT ?`,
      [limit]
    );
  }

  // Get user game history
  static async getUserHistory(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    
    const sessions = await query(
      `SELECT gs.*, 
              COUNT(gq.id) as questions_asked
       FROM game_sessions gs
       LEFT JOIN game_questions gq ON gs.id = gq.game_session_id
       WHERE gs.created_by = ?
       GROUP BY gs.id
       ORDER BY gs.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM game_sessions WHERE created_by = ?`,
      [userId]
    );

    return {
      sessions,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  }
}

module.exports = GameSession;
