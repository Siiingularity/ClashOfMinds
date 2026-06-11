const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
static async create({ username, email, phone, password, role = 'user', isHashed = false }) {
  const finalPassword = isHashed ? password : await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, phone, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, phone, finalPassword, role]
  );

  return result.insertId;
}

  static async findById(id) {
    const users = await query(
      `SELECT id, username, email, phone, role, games_played, games_won,
              total_score, is_active, created_at, last_login
       FROM users
       WHERE id = ?`,
      [id]
    );

    return users[0] || null;
  }

  static async findByUsername(username) {
    const users = await query(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );
    return users[0] || null;
  }

  static async findByEmail(email) {
    const users = await query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return users[0] || null;
  }

  static async findByPhone(phone) {
    const users = await query(
      `SELECT * FROM users WHERE phone = ?`,
      [phone]
    );
    return users[0] || null;
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updateLastLogin(id) {
    await query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
  }

  static async updateStats(id, { gamesPlayed, gamesWon, totalScore }) {
    const updates = [];
    const values = [];

    if (gamesPlayed !== undefined) {
      updates.push('games_played = games_played + ?');
      values.push(gamesPlayed);
    }

    if (gamesWon !== undefined) {
      updates.push('games_won = games_won + ?');
      values.push(gamesWon);
    }

    if (totalScore !== undefined) {
      updates.push('total_score = total_score + ?');
      values.push(totalScore);
    }

    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  static async update(id, updates) {
    const allowedFields = ['username', 'email', 'phone', 'password', 'is_active'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (key === 'password') {
          values.push(await bcrypt.hash(value, 10));
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return true;
  }

  static async delete(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }

  static async getAll({ page = 1, limit = 20, search = '', role = null }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const users = await query(
      `SELECT id, username, email, phone, role, games_played, games_won,
              total_score, is_active, created_at, last_login
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    return {
      users,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  }

  static async getLeaderboard(limit = 10) {
    return await query(
      `SELECT id, username, games_won, total_score,
              (games_won / NULLIF(games_played, 0) * 100) as win_rate
       FROM users
       WHERE is_active = TRUE
       ORDER BY total_score DESC, games_won DESC
       LIMIT ?`,
      [limit]
    );
  }
}

module.exports = User;
