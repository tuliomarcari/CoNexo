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

// --- ROTAS DE PROJETOS ---
app.get("/projetos", (req, res) => {
  pool.query("SELECT * FROM projetos ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.post("/projetos", (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id } = req.body;
  const sql = "INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id) VALUES (?,?,?,?,?,?,?,?)";
  pool.query(sql, [empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id || 1], (err, result) => {
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

app.delete("/ideias/:id", (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM ideias WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Ideia excluída com sucesso!" });
  });
});

// --- AJUSTE DA PORTA PARA O RENDER ---
// Ele tenta usar a variável PORT do Render, se não existir, usa a 3001
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor CoNexo rodando na porta ${port}`);
});