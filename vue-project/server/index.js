require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configuração da conexão usando as variáveis do Render
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, // Aqui ele vai ler 'defaultdb'
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// --- FUNÇÃO QUE CRIA AS TABELAS AUTOMATICAMENTE ---
const inicializarBanco = async () => {
  try {
    console.log("🛠️ Verificando estrutura do banco...");

    // Cria tabela de usuários para o cadastro funcionar
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nivel VARCHAR(20) DEFAULT 'cliente'
      )
    `);

    // Cria ou atualiza a tabela de projetos
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

    console.log("✅ Banco de dados 'defaultdb' pronto para uso!");
  } catch (err) {
    console.error("❌ Erro ao configurar tabelas:", err.message);
  }
};
inicializarBanco();

// --- ROTA DE CADASTRO ---
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, 'cliente')",
      [nome, email, senha]
    );
    res.status(201).json({ id: result.insertId, message: "Sucesso!" });
  } catch (err) {
    console.error("Erro no cadastro:", err.sqlMessage);
    res.status(500).json({ error: err.sqlMessage || "Erro ao salvar" });
  }
});

// --- ROTA DE LOGIN ---
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
      [empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone]
    );
    res.status(201).json({ message: "Projeto publicado!" });
  } catch (err) { res.status(500).json(err); }
});

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});