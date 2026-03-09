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

// Função para garantir que o banco permita a exclusão em cascata
const inicializarBanco = async () => {
  try {
    console.log("🚀 Verificando integridade das tabelas...");
    
    // Criar tabelas básicas se não existirem
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255), email VARCHAR(255) UNIQUE, senha VARCHAR(255), nivel VARCHAR(50) DEFAULT 'cliente')`);
    await pool.query(`CREATE TABLE IF NOT EXISTS projetos (id INT AUTO_INCREMENT PRIMARY KEY, empresa VARCHAR(255), estado VARCHAR(10), cidade VARCHAR(255), nicho VARCHAR(255), descricao TEXT, valor DECIMAL(15,2), porcentagem INT, usuario_id INT, email_contato VARCHAR(255), telefone VARCHAR(20))`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ideias (id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255), nicho VARCHAR(100), descricao TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tickets (id INT AUTO_INCREMENT PRIMARY KEY, projeto_id INT, cliente_id INT, status VARCHAR(50) DEFAULT 'em_analise', data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS mensagens (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, remetente_id INT, conteudo TEXT, data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    console.log("✅ Tabelas sincronizadas. Aplicando regras de exclusão...");
    
    // Tenta aplicar o CASCADE (Isso evita o erro 500 ao excluir)
    try {
        await pool.query("ALTER TABLE tickets ADD CONSTRAINT fk_projeto FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE");
        await pool.query("ALTER TABLE mensagens ADD CONSTRAINT fk_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE");
    } catch (e) {
        // Se já existirem as constraints, ele apenas ignora o erro
    }

    console.log("✅ Sistema CoNexo pronto!");
  } catch (err) {
    console.error("❌ Erro na inicialização:", err.message);
  }
};
inicializarBanco();

// --- ROTAS DE AUTENTICAÇÃO ---
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
    await pool.query("INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone) VALUES (?,?,?,?,?,?,?,?,?,?)", 
    [empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id || 1, email_contato, telefone]);
    res.status(201).json({ message: "Publicado!" });
  } catch (err) { res.status(500).json(err); }
});

// ROTA DE EXCLUSÃO (Agora muito mais simples e confiável)
app.delete("/projetos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Com o CASCADE configurado acima, deletar o projeto já limpa tickets e mensagens automaticamente
    const [result] = await pool.query("DELETE FROM projetos WHERE id = ?", [id]);
    
    if (result.affectedRows > 0) {
      res.json({ message: "Excluído com sucesso!" });
    } else {
      res.status(404).json({ error: "Não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
    res.status(500).json({ error: "Erro interno ao excluir projeto no banco." });
  }
});

// --- ROTAS DE IDEIAS ---
app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ideias ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
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
    await pool.query("DELETE FROM ideias WHERE id = ?", [req.params.id]);
    res.json({ message: "Removida" });
  } catch (err) { res.status(500).json(err); }
});

// --- TICKETS E MENSAGENS ---
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
  console.log(`🚀 CoNexo rodando na porta ${port}`);
});