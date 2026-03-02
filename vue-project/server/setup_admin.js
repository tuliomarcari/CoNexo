require('dotenv').config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

const sqlCommands = [
  `CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      senha VARCHAR(255),
      nivel ENUM('user', 'admin') DEFAULT 'user'
  );`,
  `INSERT IGNORE INTO usuarios (nome, email, senha, nivel) 
   VALUES ('Administrador', 'admin@conexo.com', 'admin123', 'admin');`,
  `ALTER TABLE ideias ADD COLUMN IF NOT EXISTS nicho VARCHAR(255) AFTER titulo;`
];

async function setup() {
  console.log("⏳ Conectando ao Aiven para configurar Admin...");
  for (let sql of sqlCommands) {
    try {
      await pool.promise().query(sql);
      console.log("✅ Comando executado com sucesso!");
    } catch (err) {
      console.log("⚠️ Nota:", err.message);
    }
  }
  console.log("🚀 Tudo pronto! Pode deletar este arquivo.");
  process.exit();
}

setup();