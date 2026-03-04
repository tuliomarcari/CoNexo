require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configuração da Pool com Promises para o defaultdb
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// --- SINCRONIZAÇÃO AUTOMÁTICA DO BANCO ---
const inicializarBanco = async () => {
  try {
    console.log("🚀 Verificando e corrigindo estrutura do banco...");

    // 1. Tabela de Usuários (Correção do Nível incluída)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nivel VARCHAR(50) DEFAULT 'cliente'
      )
    `);
    await pool.query("ALTER TABLE usuarios MODIFY COLUMN nivel VARCHAR(50) DEFAULT 'cliente'");

    // 2. Tabela de Projetos (Com campos de contato)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empresa VARCHAR(255),
        estado VARCHAR(10),
        cidade VARCHAR(255),
        nicho VARCHAR(255),
        descricao TEXT,
        valor DECIMAL(15,2),
        porcentagem INT,
        usuario_id INT,
        email_contato VARCHAR(255),
        telefone VARCHAR(20)
      )
    `);

    // 3. Tabela de Ideias (Para corrigir o erro de 'Nenhuma ideia ainda')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ideias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        nicho VARCHAR(100),
        descricao TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Todas as tabelas (Usuários, Projetos e Ideias) estão prontas!");
  } catch (err) {
    console.error("❌ Erro na inicialização:", err.message);
  }
};
inicializarBanco();

// --- ROTAS DE USUÁRIOS ---
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, 'cliente')",
      [nome, email, senha]
    );
    res.status(201).json({ id: result.insertId, message: "Sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage || "Erro no cadastro" });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(401).json({ message: "Login incorreto" });
  } catch (err) { res.status(500).json(err); }
});

// --- ROTAS DE PROJETOS ---
app.get("/projetos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projetos ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone } = req.body;
  try {
    await pool.query(
      "INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id || 1, email_contato, telefone]
    );
    res.status(201).json({ message: "Projeto publicado!" });
  } catch (err) { res.status(500).json(err); }
});

// --- ROTAS DE IDEIAS (CORRIGIDAS) ---
app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ideias ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar ideias" });
  }
});

app.post("/ideias", async (req, res) => {
  const { titulo, nicho, descricao } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO ideias (titulo, nicho, descricao) VALUES (?, ?, ?)",
      [titulo, nicho, descricao]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar ideia" });
  }
});

// --- INICIALIZAÇÃO ---
const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 CoNexo rodando na porta ${port}`);
});