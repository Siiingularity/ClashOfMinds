const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class PendingRegistration {
  static normalizePhone(phone) {
    return String(phone || '').replace(/\s+/g, '').trim();
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async findByPhone(phone) {
    const normalizedPhone = this.normalizePhone(phone);
    const rows = await query(
      `SELECT * FROM pending_registrations WHERE phone = ?`,
      [normalizedPhone]
    );
    return rows[0] || null;
  }

  static async deleteByPhone(phone) {
    const normalizedPhone = this.normalizePhone(phone);
    await query(
      `DELETE FROM pending_registrations WHERE phone = ?`,
      [normalizedPhone]
    );
  }

  static async cleanupExpired() {
    await query(
      `DELETE FROM pending_registrations WHERE otp_expires_at < NOW()`,
      []
    );
  }

  static async createOrUpdate({ username, email, phone, password }) {
    const normalizedPhone = this.normalizePhone(phone);
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = this.generateOTP();

    const existing = await this.findByPhone(normalizedPhone);

    if (existing) {
      await query(
        `UPDATE pending_registrations
         SET username = ?, email = ?, password = ?, otp_code = ?,
             otp_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE),
             attempts_count = 0,
             updated_at = CURRENT_TIMESTAMP
         WHERE phone = ?`,
        [username, email, hashedPassword, otpCode, normalizedPhone]
      );
    } else {
      await query(
        `INSERT INTO pending_registrations
         (username, email, phone, password, otp_code, otp_expires_at, attempts_count, resend_count)
         VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0, 0)`,
        [username, email, normalizedPhone, hashedPassword, otpCode]
      );
    }

    return {
      phone: normalizedPhone,
      otpCode
    };
  }

  static async incrementAttempts(phone) {
    const normalizedPhone = this.normalizePhone(phone);
    await query(
      `UPDATE pending_registrations
       SET attempts_count = attempts_count + 1
       WHERE phone = ?`,
      [normalizedPhone]
    );
  }

  static async incrementResend(phone) {
    const normalizedPhone = this.normalizePhone(phone);
    const otpCode = this.generateOTP();

    await query(
      `UPDATE pending_registrations
       SET otp_code = ?,
           otp_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE),
           resend_count = resend_count + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE phone = ?`,
      [otpCode, normalizedPhone]
    );

    return otpCode;
  }

  static async verifyOTP(phone, otp) {
    const normalizedPhone = this.normalizePhone(phone);

    const rows = await query(
      `SELECT * FROM pending_registrations
       WHERE phone = ?`,
      [normalizedPhone]
    );

    const record = rows[0] || null;

    if (!record) {
      return { ok: false, reason: 'not_found' };
    }

    if (new Date(record.otp_expires_at).getTime() < Date.now()) {
      await this.deleteByPhone(normalizedPhone);
      return { ok: false, reason: 'expired' };
    }

    if ((record.attempts_count || 0) >= 5) {
      await this.deleteByPhone(normalizedPhone);
      return { ok: false, reason: 'too_many_attempts' };
    }

    if (record.otp_code !== otp) {
      await this.incrementAttempts(normalizedPhone);
      return { ok: false, reason: 'invalid_code' };
    }

    return { ok: true, record };
  }
}

module.exports = PendingRegistration;
