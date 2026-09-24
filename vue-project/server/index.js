const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Aumento do limite de payload para aceitar imagens em Base64 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Configuração da conexão com o banco de dados MySQL (Aiven)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
});

// Função de inicialização para garantir que a coluna da imagem suporte LONGTEXT
async function inicializarBanco() {
  try {
    const connection = await pool.getConnection();
    await connection.query("ALTER TABLE projetos MODIFY COLUMN imagem_url LONGTEXT;");
    console.log("✅ Tabela 'projetos' verificada: coluna 'imagem_url' ajustada para LONGTEXT com sucesso.");
    connection.release();
  } catch (err) {
    console.error("⚠️ Aviso na inicialização da tabela:", err.message);
  }
}

// Rota de listagem pública de projetos aprovados
app.get("/projetos", async (req, res) => {
  try {
    const [projetos] = await pool.query("SELECT * FROM projetos WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(projetos);
  } catch (err) {
    console.error("Erro ao carregar projetos aprovados:", err);
    res.status(500).json({ error: "Erro ao carregar projetos" });
  }
});

// Rota de Cadastro de Projetos
app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, email, telefone, imagem_url } = req.body;

  try {
    const statusInicial = 'pendente';
    console.log(`[Projeto] A cadastrar projeto: "${empresa}" | Imagem size: ${imagem_url ? imagem_url.length : 0}`);

    await pool.query(
      `INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone, imagem_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empresa || '',
        estado || '',
        cidade || '',
        nicho || '',
        descricao || '',
        valor || 0,
        porcentagem || 0,
        usuario_id || null,
        email_contato || email || null,
        telefone || null,
        imagem_url || null,
        statusInicial
      ]
    );

    res.json({ message: "Projeto enviado para análise com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao cadastrar projeto:", err);
    res.status(500).json({ error: "Erro interno ao cadastrar projeto", details: err.message });
  }
});

// Rota para buscar itens pendentes para o painel administrativo
app.get("/admin/pendentes", async (req, res) => {
  try {
    const [projetos] = await pool.query("SELECT *, 'projeto' as tipo_item FROM projetos WHERE status = 'pendente'");
    const [ideias] = await pool.query("SELECT *, 'ideia' as tipo_item FROM ideias WHERE status = 'pendente'");
    res.json([...projetos, ...ideias]);
  } catch (err) {
    console.error("Erro ao carregar pendentes:", err);
    res.status(500).json({ error: "Erro ao carregar dados pendentes" });
  }
});

// Rota para buscar lojas cadastradas
app.get("/admin/lojas", async (req, res) => {
  try {
    const [lojas] = await pool.query("SELECT * FROM lojas");
    res.json(lojas);
  } catch (err) {
    console.error("Erro ao carregar lojas:", err);
    res.status(500).json({ error: "Erro ao carregar lojas" });
  }
});

// Rota para aprovar projetos ou ideias
app.put("/admin/aprovar/:id", async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;
  const tabela = tipo === 'ideia' ? 'ideias' : 'projetos';

  try {
    console.log(`[Admin] A aprovar ${tabela} com ID: ${id}`);
    const [resultado] = await pool.query(`UPDATE ${tabela} SET status = 'aprovado' WHERE id = ?`, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Item não encontrado para aprovação." });
    }

    res.json({ message: "Item aprovado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao aprovar item:", err);
    res.status(500).json({ error: "Erro ao aprovar item", details: err.message });
  }
});

// Rota para excluir projetos
app.delete("/projetos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM projetos WHERE id = ?", [id]);
    res.json({ message: "Projeto excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir projeto:", err);
    res.status(500).json({ error: "Erro ao excluir projeto" });
  }
});

// Rota para excluir ideias
app.delete("/ideias/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM ideias WHERE id = ?", [id]);
    res.json({ message: "Ideia excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir ideia:", err);
    res.status(500).json({ error: "Erro ao excluir ideia" });
  }
});

// Rota para excluir lojas
app.delete("/admin/lojas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM lojas WHERE id = ?", [id]);
    res.json({ message: "Loja excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir loja:", err);
    res.status(500).json({ error: "Erro ao excluir loja" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  await inicializarBanco();
});