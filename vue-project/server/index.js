require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configuração da Pool com suporte a Promises
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
}).promise(); // Adicionado .promise() para evitar erros de sincronia

// --- INICIALIZAÇÃO DO BANCO (EXECUTADO AO SUBIR NO RENDER) ---
const inicializarBanco = async () => {
  try {
    // 1. Criar tabela de usuários se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nivel VARCHAR(20) DEFAULT 'cliente'
      )
    `);

    // 2. Garantir colunas novas na tabela de projetos
    const [colunas] = await pool.query("SHOW COLUMNS FROM projetos");
    const nomesColunas = colunas.map(c => c.Field);

    if (!nomesColunas.includes('email_contato')) {
      await pool.query("ALTER TABLE projetos ADD COLUMN email_contato VARCHAR(255)");
    }
    if (!nomesColunas.includes('telefone')) {
      await pool.query("ALTER TABLE projetos ADD COLUMN telefone VARCHAR(20)");
    }
    
    console.log("✅ Banco de dados sincronizado com sucesso!");
  } catch (err) {
    console.error("❌ Erro na inicialização do banco:", err.message);
  }
};
inicializarBanco();

// --- ROTA DE LOGIN ---
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query("SELECT id, nome, nivel FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
    if (rows.length > 0) {
      res.send(rows[0]);
    } else {
      res.status(401).send({ message: "E-mail ou senha incorretos!" });
    }
  } catch (err) {
    res.status(500).send({ message: "Erro no servidor" });
  }
});

// --- ROTA DE CADASTRO (CLIENTES) ---
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  try {
    const [existente] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existente.length > 0) {
      return res.status(400).send({ message: "Este e-mail já está cadastrado!" });
    }

    const nivel = tipo === 'admin' ? 'admin' : 'cliente';
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)",
      [nome, email, senha, nivel]
    );
    res.status(201).send({ id: result.insertId, nome, email, nivel });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Erro ao realizar cadastro no banco." });
  }
});

// --- ROTAS DE PROJETOS ---
app.get("/projetos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projetos ORDER BY id DESC");
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone } = req.body;
  const sql = `INSERT INTO projetos 
    (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone) 
    VALUES (?,?,?,?,?,?,?,?,?,?)`;
  
  try {
    const [result] = await pool.query(sql, [
      empresa, estado, cidade, nicho, descricao, valor, porcentagem, 
      usuario_id || 1, email_contato, telefone
    ]);
    res.status(201).send({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.delete("/projetos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM projetos WHERE id = ?", [id]);
    res.send({ message: "Projeto excluído com sucesso!" });
  } catch (err) {
    res.status(500).send(err);
  }
});

// --- ROTAS DE IDEIAS ---
app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ideias ORDER BY id DESC");
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/ideias", async (req, res) => {
  const { titulo, nicho, descricao } = req.body;
  try {
    const [result] = await pool.query("INSERT INTO ideias (titulo, nicho, descricao) VALUES (?, ?, ?)", [titulo, nicho, descricao]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor CoNexo rodando na porta ${port}`);
});