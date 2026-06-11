const mysql = require('mysql2/promise');
require('dotenv').config();

function buildConnectionConfig() {
  if (process.env.MYSQL_PUBLIC_URL) {
    return process.env.MYSQL_PUBLIC_URL;
  }

  if (process.env.MYSQL_URL) {
    return process.env.MYSQL_URL;
  }

  return {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    multipleStatements: true,
  };
}

const initDatabase = async () => {
  let connection;

  try {
    const connectionConfig = buildConnectionConfig();
    const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'clash_of_minds';

    console.log('DB INIT DEBUG:', {
      usingPublicUrl: !!process.env.MYSQL_PUBLIC_URL,
      usingInternalUrl: !!process.env.MYSQL_URL,
      dbName,
    });

    connection = await mysql.createConnection(connectionConfig);

    console.log('✅ Connected to MySQL server');

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database '${dbName}' ready`);

    await connection.query(`USE \`${dbName}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        games_played INT DEFAULT 0,
        games_won INT DEFAULT 0,
        total_score INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);

    await connection.query(`
  CREATE TABLE IF NOT EXISTS pending_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_expires_at DATETIME NOT NULL,
    attempts_count INT DEFAULT 0,
    resend_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) NOT NULL UNIQUE,
        \`value\` TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name_ar VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        slug VARCHAR(50) NOT NULL UNIQUE,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    \`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name_ar VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        description_ar TEXT,
        description_en TEXT,
        section VARCHAR(50) NOT NULL,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        question_count INT DEFAULT 6,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        question_ar TEXT NOT NULL,
        question_en TEXT NOT NULL,
        answer_ar TEXT NOT NULL,
        answer_en TEXT NOT NULL,
        points INT DEFAULT 200,
        difficulty ENUM('easy','medium','hard') DEFAULT 'easy',
        image_url VARCHAR(500),
        answer_image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_name VARCHAR(100),
        team1_name VARCHAR(100),
        team2_name VARCHAR(100),
        team1_score INT DEFAULT 0,
        team2_score INT DEFAULT 0,
        winner VARCHAR(100),
        status ENUM('active','completed','abandoned') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS game_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_session_id INT,
        question_id INT,
        asked_by_team INT,
        answered_by_team INT,
        is_correct BOOLEAN,
        points_earned INT DEFAULT 0,
        asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS game_category_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_session_id INT NOT NULL,
        category_id INT NOT NULL,
        question_group_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS powerups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name_ar VARCHAR(100),
        name_en VARCHAR(100),
        description_ar TEXT,
        description_en TEXT,
        icon_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_powerups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        powerup_id INT,
        quantity INT DEFAULT 0
      )
    `);

    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'TheGreatestAdminOfAllTime2164661726%%%$%^',
      10
    );

    await connection.query(
      `INSERT IGNORE INTO users (username, email, password, role)
       VALUES (?, ?, ?, 'admin')`,
      [
        process.env.ADMIN_USERNAME || 'admin',
        process.env.ADMIN_EMAIL || 'zeidan0997@gmail.com',
        adminPassword,
      ]
    );

    await connection.query(`
      INSERT IGNORE INTO powerups (id, name_ar, name_en, description_ar, description_en, icon_url, is_active) VALUES
      (1, 'سرقة السؤال', 'Steal Question', 'يمكنك سرقة سؤال الفريق الخصم والإجابة عليه', 'Steal opponent question', 'https://i.imgur.com/e1Ywhk4.png', TRUE),
      (2, 'منع الخصم', 'Block Opponent', 'يمنع الفريق الخصم من الإجابة على السؤال القادم', 'Blocks opponent from answering', 'https://i.imgur.com/VtMtaCu.png', TRUE),
      (3, 'تدبيل النقاط', 'Double Points', 'يتم تدبيل نقاط السؤال القادم', 'Double next question points', 'https://i.imgur.com/PdUyRQG.png', TRUE),
      (4, 'اتصال بصديق', 'Call a Friend', 'اتصل بصديق للمساعدة في الإجابة', 'Call a friend for help', 'https://i.imgur.com/r2gvY0n.png', TRUE),
      (5, 'إجابتين', 'Two Answers', 'يمكنك تجربة إجابتين للسؤال', 'Try two answers', 'https://i.imgur.com/3R4plWC.png', TRUE)
    `);

    console.log('🎉 DB READY 100%');
  } catch (error) {
    console.error('❌ DB INIT ERROR:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();
