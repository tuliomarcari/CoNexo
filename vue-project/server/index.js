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
    
    // Usuarios
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255), email VARCHAR(255) UNIQUE, senha VARCHAR(255), nivel VARCHAR(50) DEFAULT 'cliente')`);
    
    // Projetos (Adicionado campo STATUS)
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
        telefone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pendente'
      )
    `);

    // Ideias (Adicionado campo STATUS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ideias (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        titulo VARCHAR(255), 
        nicho VARCHAR(100), 
        descricao TEXT, 
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pendente'
      )
    `);

    await pool.query(`CREATE TABLE IF NOT EXISTS tickets (id INT AUTO_INCREMENT PRIMARY KEY, projeto_id INT, cliente_id INT, status VARCHAR(50) DEFAULT 'em_analise', data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS mensagens (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, remetente_id INT, conteudo TEXT, data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    // Garante que a coluna status exista caso as tabelas já tenham sido criadas antes
    await pool.query("ALTER TABLE projetos ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendente'");
    await pool.query("ALTER TABLE ideias ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendente'");

    console.log("✅ Banco de dados atualizado para Moderação!");
  } catch (err) {
    console.error("❌ Erro na inicialização:", err.message);
  }
};
inicializarBanco();

// --- ROTAS DE PROJETOS (FILTRADAS PARA O PÚBLICO) ---
app.get("/projetos", async (req, res) => {
  try {
    // O público só vê projetos 'aprovados'
    const [rows] = await pool.query("SELECT * FROM projetos WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone } = req.body;
  try {
    // Todo novo projeto entra como 'pendente'
    await pool.query("INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone, status) VALUES (?,?,?,?,?,?,?,?,?,?, 'pendente')", 
    [empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id || 1, email_contato, telefone]);
    res.status(201).json({ message: "Projeto enviado para análise!" });
  } catch (err) { res.status(500).json(err); }
});

// --- ROTAS DE IDEIAS (FILTRADAS PARA O PÚBLICO) ---
app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ideias WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.post("/ideias", async (req, res) => {
  const { titulo, nicho, descricao } = req.body;
  try {
    await pool.query("INSERT INTO ideias (titulo, nicho, descricao, status) VALUES (?, ?, ?, 'pendente')", [titulo, nicho, descricao]);
    res.status(201).json({ message: "Ideia enviada para análise!" });
  } catch (err) { res.status(500).json(err); }
});

// --- NOVAS ROTAS DE ADMINISTRAÇÃO ---

// Busca tudo que está pendente de uma vez
app.get("/admin/pendentes", async (req, res) => {
  try {
    const [projetos] = await pool.query("SELECT * FROM projetos WHERE status = 'pendente' ORDER BY id DESC");
    const [ideias] = await pool.query("SELECT * FROM ideias WHERE status = 'pendente' ORDER BY id DESC");
    res.json({ projetos, ideias });
  } catch (err) { res.status(500).json({ error: "Erro ao buscar pendentes" }); }
});

// Aprova um item (projeto ou ideia)
app.patch("/admin/aprovar/:tipo/:id", async (req, res) => {
  const { tipo, id } = req.params;
  const tabela = tipo === 'projeto' ? 'projetos' : 'ideias';
  try {
    const [result] = await pool.query(`UPDATE ${tabela} SET status = 'aprovado' WHERE id = ?`, [id]);
    if (result.affectedRows > 0) {
      res.json({ message: `${tipo === 'projeto' ? 'Projeto' : 'Ideia'} aprovado com sucesso!` });
    } else {
      res.status(404).json({ error: "Item não encontrado." });
    }
  } catch (err) { res.status(500).json({ error: "Erro ao aprovar item." }); }
});

// Reutiliza a lógica de exclusão para "reprovar" (deletar) um item
app.delete("/projetos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM mensagens WHERE ticket_id IN (SELECT id FROM tickets WHERE projeto_id = ?)", [req.params.id]);
    await pool.query("DELETE FROM tickets WHERE projeto_id = ?", [req.params.id]);
    await pool.query("DELETE FROM projetos WHERE id = ?", [req.params.id]);
    res.json({ message: "Projeto removido!" });
  } catch (err) { res.status(500).json({ error: "Erro ao excluir" }); }
});

app.delete("/ideias/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM ideias WHERE id = ?", [req.params.id]);
    res.json({ message: "Ideia removida!" });
  } catch (err) { res.status(500).json({ error: "Erro ao excluir" }); }
});

// --- ROTAS DE AUTENTICAÇÃO, TICKETS E MENSAGENS (MANTIDAS) ---
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    await pool.query("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senha]);
    res.status(201).json({ message: "Cadastrado!" });
  } catch (err) { res.status(500).json({ error: "Erro ao cadastrar" }); }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(401).json({ message: "Incorreto" });
  } catch (err) { res.status(500).json({ error: "Erro no servidor" }); }
});

app.post("/tickets", async (req, res) => {
  const { projeto_id, cliente_id } = req.body;
  try {
    const [ex] = await pool.query("SELECT id FROM tickets WHERE projeto_id = ? AND cliente_id = ?", [projeto_id, cliente_id]);
    if (ex.length > 0) return res.json({ ticketId: ex[0].id });
    const [result] = await pool.query("INSERT INTO tickets (projeto_id, cliente_id) VALUES (?, ?)", [projeto_id, cliente_id]);
    res.status(201).json({ ticketId: result.insertId });
  } catch (err) { res.status(500).json(err); }
});

app.post("/mensagens", async (req, res) => {
  const { ticket_id, remetente_id, conteudo } = req.body;
  try {
    await pool.query("INSERT INTO mensagens (ticket_id, remetente_id, conteudo) VALUES (?, ?, ?)", [ticket_id, remetente_id, conteudo]);
    res.status(201).json({ message: "Enviada" });
  } catch (err) { res.status(500).json(err); }
});

app.get("/admin/tickets", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT t.*, p.empresa, u.nome as nome_cliente FROM tickets t JOIN projetos p ON t.projeto_id = p.id JOIN usuarios u ON t.cliente_id = u.id ORDER BY t.data_abertura DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.get("/tickets/:id/mensagens", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT m.*, u.nome as nome_remetente, u.nivel FROM mensagens m JOIN usuarios u ON m.remetente_id = u.id WHERE m.ticket_id = ? ORDER BY m.data_envio ASC", [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 CoNexo Moderação rodando na porta ${port}`);
});