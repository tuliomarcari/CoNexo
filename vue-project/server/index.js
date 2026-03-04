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
  database: process.env.DB_NAME, // Lendo 'defaultdb' do Render
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// --- CORREÇÃO AUTOMÁTICA DO BANCO ---
const inicializarBanco = async () => {
  try {
    console.log("🚀 Verificando e corrigindo estrutura do banco...");

    // 1. Garante que a tabela de usuários existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nivel VARCHAR(50) DEFAULT 'cliente'
      )
    `);

    // 2. CORREÇÃO DO ERRO 500: Aumenta o espaço da coluna 'nivel'
    // Isso resolve o erro "Data truncated for column 'nivel'" visto nos logs
    await pool.query("ALTER TABLE usuarios MODIFY COLUMN nivel VARCHAR(50) DEFAULT 'cliente'");
    
    // 3. Garante que a tabela de projetos tem os novos campos de contato
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

    console.log("✅ Banco de dados 'defaultdb' pronto e corrigido!");
  } catch (err) {
    console.error("❌ Erro na inicialização:", err.message);
  }
};
inicializarBanco();

// --- ROTA DE CADASTRO ---
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    // Insere o novo usuário (o nivel padrão será 'cliente' e agora cabe no banco)
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, 'cliente')",
      [nome, email, senha]
    );
    console.log("👤 Novo usuário cadastrado:", email);
    res.status(201).json({ id: result.insertId, nome, email, message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro no cadastro:", err.sqlMessage || err.message);
    res.status(500).json({ error: err.sqlMessage || "Erro ao salvar usuário" });
  }
});

// --- ROTA DE LOGIN ---
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(401).json({ message: "E-mail ou senha incorretos." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// --- ROTAS DE PROJETOS ---
app.get("/projetos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projetos ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone } = req.body;
  try {
    const sql = `INSERT INTO projetos 
      (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone) 
      VALUES (?,?,?,?,?,?,?,?,?,?)`;
    
    await pool.query(sql, [
      empresa, estado, cidade, nicho, descricao, valor, porcentagem, 
      usuario_id || 1, email_contato, telefone
    ]);
    res.status(201).json({ message: "Projeto publicado com sucesso!" });
  } catch (err) {
    console.error("Erro ao publicar projeto:", err);
    res.status(500).json(err);
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const port = process.env.PORT || 10000; // Ajustado para a porta padrão do Render nos logs
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor CoNexo rodando na porta ${port}`);
});