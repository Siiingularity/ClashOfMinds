const { query } = require('../config/database');

class SiteSettings {
  static async getAll() {
    return query('SELECT * FROM site_settings ORDER BY `key` ASC');
  }

  static async get(key) {
    const rows = await query('SELECT * FROM site_settings WHERE `key` = ?', [key]);
    return rows[0] || null;
  }

  static async set(key, value) {
    await query(
      'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
      [key, value, value]
    );
    return { key, value };
  }

  static async delete(key) {
    await query('DELETE FROM site_settings WHERE `key` = ?', [key]);
  }
}

module.exports = SiteSettings;
