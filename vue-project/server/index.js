const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Aumento do limite de payload para aceitar imagens em Base64 comprimidas (50MB)
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
    console.error("⚠️ Aviso na inicialização da tabela (pode já estar ajustada):", err.message);
  }
}

// Rota de Cadastro de Projetos (com suporte a imagem Base64 e tratamento de erros)
app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, email, telefone, imagem_url } = req.body;

  try {
    const statusInicial = 'pendente';

    console.log(`[Projeto] A cadastrar projeto para a empresa: "${empresa}" | Tamanho da imagem recebida: ${imagem_url ? imagem_url.length : 0} caracteres`);

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
    console.error("❌ Erro detalhado ao cadastrar projeto no banco de dados:", err);
    res.status(500).json({ error: "Erro interno ao cadastrar projeto", details: err.message });
  }
});

// Outras rotas do seu sistema (Admin pendentes, aprovação, etc.) continuam aqui...

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  await inicializarBanco();
});