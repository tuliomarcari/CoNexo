require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do Pool de Conexão com Suporte a Promises
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

// Inicialização das Tabelas e Verificação do Banco
const inicializarBanco = async () => {
  try {
    console.log("🚀 Sincronizando Tabelas CoNexo...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nivel VARCHAR(50) DEFAULT 'cliente'
      )
    `);

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ideias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        nicho VARCHAR(100),
        descricao TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT,
        cliente_id INT,
        status VARCHAR(50) DEFAULT 'em_analise',
        data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensagens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT,
        remetente_id INT,
        conteudo TEXT NOT NULL,
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Banco de Dados Pronto para Operação!");
  } catch (err) {
    console.error("❌ Erro na inicialização:", err.message);
  }
};
inicializarBanco();

// --- ROTAS DE AUTENTICAÇÃO ---
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, 'cliente')",
      [nome, email, senha]
    );
    res.status(201).json({ message: "Usuário cadastrado!" });
  } catch (err) {
    res.status(500).json({ error: "E-mail já cadastrado ou erro no banco." });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(401).json({ message: "Usuário ou senha incorretos." });
  } catch (err) { res.status(500).json({ error: "Erro interno no servidor." }); }
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

// ROTA CRÍTICA: Exclusão em Cascata (Resolvendo o Erro 500)
app.delete("/projetos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Apaga mensagens dos tickets vinculados a este projeto
    await pool.query(`
      DELETE FROM mensagens 
      WHERE ticket_id IN (SELECT id FROM tickets WHERE projeto_id = ?)
    `, [id]);
    
    // 2. Apaga os tickets do projeto
    await pool.query("DELETE FROM tickets WHERE projeto_id = ?", [id]);
    
    // 3. Finalmente apaga o projeto
    const [result] = await pool.query("DELETE FROM projetos WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      res.json({ message: "Projeto e histórico excluídos com sucesso!" });
    } else {
      res.status(404).json({ error: "Projeto não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao deletar projeto:", err);
    res.status(500).json({ error: "Erro interno ao excluir projeto no banco." });
  }
});

// --- ROTAS DE IDEIAS ---
app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ideias ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Erro ao buscar ideias." }); }
});

app.post("/ideias", async (req, res) => {
    const { titulo, nicho, descricao } = req.body;
    try {
      await pool.query("INSERT INTO ideias (titulo, nicho, descricao) VALUES (?, ?, ?)", [titulo, nicho, descricao]);
      res.status(201).json({ message: "Ideia publicada!" });
    } catch (err) { res.status(500).json(err); }
});

app.delete("/ideias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ideias WHERE id = ?", [id]);
    res.json({ message: "Ideia removida." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir ideia." });
  }
});

// --- ROTAS DE TICKETS E CHAT ---
app.post("/tickets", async (req, res) => {
  const { projeto_id, cliente_id } = req.body;
  try {
    const [existente] = await pool.query("SELECT id FROM tickets WHERE projeto_id = ? AND cliente_id = ?", [projeto_id, cliente_id]);
    if (existente.length > 0) return res.json({ ticketId: existente[0].id });
    const [result] = await pool.query("INSERT INTO tickets (projeto_id, cliente_id) VALUES (?, ?)", [projeto_id, cliente_id]);
    res.status(201).json({ ticketId: result.insertId });
  } catch (err) { res.status(500).json(err); }
});

app.post("/mensagens", async (req, res) => {
  const { ticket_id, remetente_id, conteudo } = req.body;
  try {
    await pool.query("INSERT INTO mensagens (ticket_id, remetente_id, conteudo) VALUES (?, ?, ?)", [ticket_id, remetente_id, conteudo]);
    res.status(201).json({ message: "Mensagem enviada." });
  } catch (err) { res.status(500).json(err); }
});

app.get("/admin/tickets", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, p.empresa, u.nome as nome_cliente 
      FROM tickets t
      JOIN projetos p ON t.projeto_id = p.id
      JOIN usuarios u ON t.cliente_id = u.id
      ORDER BY t.data_abertura DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.get("/tickets/:id/mensagens", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, u.nome as nome_remetente, u.nivel 
      FROM mensagens m
      JOIN usuarios u ON m.remetente_id = u.id
      WHERE m.ticket_id = ?
      ORDER BY m.data_envio ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

// Inicialização do Servidor
const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 CoNexo Central Mediação rodando na porta ${port}`);
});