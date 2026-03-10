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

const inicializarBanco = async () => {
  try {
    console.log("🚀 Sincronizando tabelas com sistema de moderação...");
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

    await pool.query(`CREATE TABLE IF NOT EXISTS tickets (id INT AUTO_INCREMENT PRIMARY KEY, projeto_id INT, cliente_id INT, status VARCHAR(50) DEFAULT 'em_analise', data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS mensagens (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, remetente_id INT, conteudo TEXT, data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    // Força a existência da coluna status em bancos já criados
    await pool.query("ALTER TABLE projetos ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendente'");
    await pool.query("ALTER TABLE ideias ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendente'");

    console.log("✅ Banco de dados pronto para CoNexo!");
  } catch (err) { console.error("❌ Erro inicialização:", err.message); }
};
inicializarBanco();

// --- ROTAS PÚBLICAS ---
app.get("/projetos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projetos WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ideias WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

// --- ROTAS ADMIN ---
app.get("/admin/pendentes", async (req, res) => {
  try {
    const [projetos] = await pool.query("SELECT * FROM projetos WHERE status = 'pendente' ORDER BY id DESC");
    const [ideias] = await pool.query("SELECT * FROM ideias WHERE status = 'pendente' ORDER BY id DESC");
    res.json({ projetos, ideias });
  } catch (err) { res.status(500).json({ error: "Erro ao buscar pendentes" }); }
});

app.patch("/admin/aprovar/:tipo/:id", async (req, res) => {
  const { tipo, id } = req.params;
  const tabela = tipo === 'projeto' ? 'projetos' : 'ideias';
  try {
    await pool.query(`UPDATE ${tabela} SET status = 'aprovado' WHERE id = ?`, [id]);
    res.json({ message: "Aprovado!" });
  } catch (err) { res.status(500).json(err); }
});

// Outras rotas (tickets, login, cadastro) permanecem as mesmas...
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
  if (rows.length > 0) res.json(rows[0]);
  else res.status(401).json({ message: "Incorreto" });
});

app.get("/admin/tickets", async (req, res) => {
  const [rows] = await pool.query("SELECT t.*, p.empresa, u.nome as nome_cliente FROM tickets t JOIN projetos p ON t.projeto_id = p.id JOIN usuarios u ON t.cliente_id = u.id ORDER BY t.data_abertura DESC");
  res.json(rows);
});

app.get("/tickets/:id/mensagens", async (req, res) => {
  const [rows] = await pool.query("SELECT m.*, u.nome as nome_remetente, u.nivel FROM mensagens m JOIN usuarios u ON m.remetente_id = u.id WHERE m.ticket_id = ? ORDER BY m.data_envio ASC", [req.params.id]);
  res.json(rows);
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 API rodando na porta ${port}`));