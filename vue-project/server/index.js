require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

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
});

// --- EXECUÇÃO ÚNICA: GARANTIR QUE O BANCO TEM AS COLUNAS NOVAS ---
// Estes comandos garantem a estrutura para salvar novos clientes e contatos de projetos
pool.query(`ALTER TABLE projetos ADD COLUMN IF NOT EXISTS email_contato VARCHAR(255)`, () => {});
pool.query(`ALTER TABLE projetos ADD COLUMN IF NOT EXISTS telefone VARCHAR(20)`, () => {});
pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel VARCHAR(20) DEFAULT 'cliente'`, () => {});

// --- ROTA DE LOGIN ---
app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const sql = "SELECT id, nome, nivel FROM usuarios WHERE email = ? AND senha = ?";
  
  pool.query(sql, [email, senha], (err, result) => {
    if (err) return res.status(500).send({ message: "Erro no servidor" });
    if (result.length > 0) {
      res.send(result[0]);
    } else {
      res.status(401).send({ message: "E-mail ou senha incorretos!" });
    }
  });
});

// --- ROTA DE CADASTRO (SALVA NOVOS CLIENTES) ---
app.post("/cadastro", (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  
  const checkSql = "SELECT id FROM usuarios WHERE email = ?";
  pool.query(checkSql, [email], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length > 0) {
      return res.status(400).send({ message: "Este e-mail já está cadastrado!" });
    }

    const sql = "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)";
    const nivel = tipo === 'admin' ? 'admin' : 'cliente';
    
    pool.query(sql, [nome, email, senha, nivel], (err, insertResult) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ id: insertResult.insertId, nome, email, nivel });
    });
  });
});

// --- ROTAS DE PROJETOS ---
app.get("/projetos", (req, res) => {
  pool.query("SELECT * FROM projetos ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.post("/projetos", (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone } = req.body;
  
  const sql = "INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone) VALUES (?,?,?,?,?,?,?,?,?,?)";
  
  pool.query(sql, [
    empresa, estado, cidade, nicho, descricao, valor, porcentagem, 
    usuario_id || 1, email_contato, telefone
  ], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ id: result.insertId, ...req.body });
  });
});

app.delete("/projetos/:id", (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM projetos WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Projeto excluído com sucesso!" });
  });
});

// --- ROTAS DE IDEIAS ---
app.get("/ideias", (req, res) => {
  pool.query("SELECT * FROM ideias ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.post("/ideias", (req, res) => {
  const { titulo, nicho, descricao } = req.body;
  const sql = "INSERT INTO ideias (titulo, nicho, descricao) VALUES (?, ?, ?)";
  pool.query(sql, [titulo, nicho, descricao], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...req.body });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor CoNexo rodando na porta ${port}`);
});