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
}).promise();

// Inicialização das tabelas (Mantenha como você já fez)
const inicializarBanco = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255), email VARCHAR(255) UNIQUE, senha VARCHAR(255), nivel VARCHAR(50) DEFAULT 'cliente')`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id INT AUTO_INCREMENT PRIMARY KEY, empresa VARCHAR(255), estado VARCHAR(10), cidade VARCHAR(255), 
        nicho VARCHAR(255), descricao TEXT, valor DECIMAL(15,2), porcentagem INT, usuario_id INT, 
        email_contato VARCHAR(255), telefone VARCHAR(20), status VARCHAR(20) DEFAULT 'pendente'
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ideias (
        id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255), nicho VARCHAR(100), descricao TEXT, 
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status VARCHAR(20) DEFAULT 'pendente'
      )
    `);
    console.log("✅ Banco de dados pronto!");
  } catch (err) { console.error("❌ Erro inicialização:", err.message); }
};
inicializarBanco();

// --- ROTAS DE CRIAÇÃO (POST) ---
app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone, status } = req.body;
  try {
    await pool.query(
      `INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone, status || 'pendente']
    );
    res.json({ message: "Projeto enviado para análise!" });
  } catch (err) { res.status(500).json(err); }
});

app.post("/ideias", async (req, res) => {
  const { titulo, nicho, descricao } = req.body;
  try {
    await pool.query("INSERT INTO ideias (titulo, nicho, descricao, status) VALUES (?, ?, ?, 'pendente')", [titulo, nicho, descricao]);
    res.json({ message: "Ideia enviada!" });
  } catch (err) { res.status(500).json(err); }
});

// --- ROTAS PÚBLICAS (HOME) ---
app.get("/projetos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projetos WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

// --- ROTAS ADMIN ---
app.get("/admin/pendentes", async (req, res) => {
  try {
    // Unificamos projetos e ideias em uma lista só para o Frontend ler facilmente
    const [projetos] = await pool.query("SELECT *, 'projeto' as tipo_item FROM projetos WHERE status = 'pendente'");
    const [ideias] = await pool.query("SELECT *, 'ideia' as tipo_item FROM ideias WHERE status = 'pendente'");
    
    // Retorna um Array único com tudo que está pendente
    res.json([...projetos, ...ideias]);
  } catch (err) { res.status(500).json({ error: "Erro ao buscar pendentes" }); }
});

app.put("/admin/aprovar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Tenta aprovar em projetos; se não afetar linhas, tenta em ideias
    const [resP] = await pool.query("UPDATE projetos SET status = 'aprovado' WHERE id = ?", [id]);
    if (resP.affectedRows === 0) {
      await pool.query("UPDATE ideias SET status = 'aprovado' WHERE id = ?", [id]);
    }
    res.json({ message: "Aprovado com sucesso!" });
  } catch (err) { res.status(500).json(err); }
});

app.delete("/projetos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM projetos WHERE id = ?", [req.params.id]);
    res.json({ message: "Removido!" });
  } catch (err) { res.status(500).json(err); }
});

// --- LOGIN ---
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(401).json({ message: "Credenciais inválidas" });
  } catch (err) { res.status(500).json(err); }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 API rodando na porta ${port}`));