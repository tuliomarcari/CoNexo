require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();

// Aumento do limite de payload para aceitar imagens em Base64 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Health Check Endpoint (Render & Uptime monitors)
app.get(["/", "/health", "/api/health"], (req, res) => {
  res.json({ status: "online", message: "Servidor CoNexo Backend ativo e operacional!" });
});

// Configuração da conexão com o banco de dados MySQL (Aiven / Render DB)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_inseguro_substitua_em_producao";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// --- FUNÇÃO AUXILIAR DE ENVIO DE E-MAIL (APROVAÇÃO) ---
async function enviarEmailAprovacao(emailDestino, tituloItem, tipo) {
  if (!emailDestino) return;
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    const assunto = `Seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} foi aprovado na plataforma CoNexo!`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9c6e; margin-top: 0;">Parabéns!</h2>
        <p>Olá,</p>
        <p>Temos o prazer de informar que o seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} <strong>"${tituloItem}"</strong> foi aprovado(a) por um administrador.</p>
        <p>Ele(a) já está visível para todos os usuários na plataforma <strong>CoNexo</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #718096;">Esta é uma mensagem automática, por favor não responda a este e-mail.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Plataforma CoNexo" <${emailUser}>`,
      to: emailDestino,
      subject: assunto,
      html: htmlContent
    });
  } catch (error) {
    console.error('[E-mail ERRO]:', error.message);
  }
}

// --- FUNÇÃO AUXILIAR DE ENVIO DE E-MAIL (RECEBIMENTO) ---
async function enviarEmailRecebimento(emailDestino, tituloItem, tipo) {
  if (!emailDestino) return;
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    const assunto = `Recebemos o seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} na plataforma CoNexo!`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9c6e; margin-top: 0;">Recebido com Sucesso!</h2>
        <p>Olá,</p>
        <p>Confirmamos o recebimento do seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} <strong>"${tituloItem}"</strong> na plataforma <strong>CoNexo</strong>.</p>
        <p>A equipe de administração irá analisar a sua publicação antes de colocá-la no ar.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #718096;">Esta é uma mensagem automática, por favor não responda a este e-mail.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Plataforma CoNexo" <${emailUser}>`,
      to: emailDestino,
      subject: assunto,
      html: htmlContent
    });
  } catch (error) {
    console.error('[E-mail ERRO]:', error.message);
  }
}

// Middleware de verificação de token (com tolerância se não informado)
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.usuario = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    req.usuario = null;
    next();
  }
};

// Inicialização do Banco de Dados: cria tabelas com tratamento individual por bloco
async function inicializarBanco() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Tabela Usuarios
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY, 
          nome VARCHAR(255), 
          email VARCHAR(255) UNIQUE, 
          senha VARCHAR(255), 
          nivel VARCHAR(50) DEFAULT 'cliente'
        )
      `);
    } catch (e) { console.error("Aviso tabela usuarios:", e.message); }

    // Tabela Projetos (com campos de likes, dislikes e franquias/filiais)
    try {
      await connection.query(`
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
          imagem_url LONGTEXT,
          status VARCHAR(20) DEFAULT 'pendente',
          likes INT DEFAULT 0,
          dislikes INT DEFAULT 0,
          eh_filial TINYINT(1) DEFAULT 0,
          marca_principal VARCHAR(255),
          estado_filial VARCHAR(50),
          cidade_filial VARCHAR(255),
          valor_repasse DECIMAL(15,2)
        )
      `);
      try { await connection.query(`ALTER TABLE projetos MODIFY COLUMN imagem_url LONGTEXT`); } catch (e) {}
      try { await connection.query(`ALTER TABLE projetos ADD COLUMN likes INT DEFAULT 0`); } catch (e) {}
      try { await connection.query(`ALTER TABLE projetos ADD COLUMN dislikes INT DEFAULT 0`); } catch (e) {}
      try { await connection.query(`ALTER TABLE projetos ADD COLUMN eh_filial TINYINT(1) DEFAULT 0`); } catch (e) {}
      try { await connection.query(`ALTER TABLE projetos ADD COLUMN marca_principal VARCHAR(255)`); } catch (e) {}
      try { await connection.query(`ALTER TABLE projetos ADD COLUMN estado_filial VARCHAR(50)`); } catch (e) {}
      try { await connection.query(`ALTER TABLE projetos ADD COLUMN cidade_filial VARCHAR(255)`); } catch (e) {}
      try { await connection.query(`ALTER TABLE projetos ADD COLUMN valor_repasse DECIMAL(15,2)`); } catch (e) {}
    } catch (e) {
      console.error("Aviso tabela projetos:", e.message);
    }

    // Tabela Ideias (com campos de likes e dislikes)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS ideias (
          id INT AUTO_INCREMENT PRIMARY KEY, 
          titulo VARCHAR(255), 
          nicho VARCHAR(100), 
          descricao TEXT, 
          data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
          status VARCHAR(20) DEFAULT 'pendente',
          likes INT DEFAULT 0,
          dislikes INT DEFAULT 0
        )
      `);
      try { await connection.query(`ALTER TABLE ideias ADD COLUMN status VARCHAR(20) DEFAULT 'pendente'`); } catch (e) {}
      try { await connection.query(`ALTER TABLE ideias ADD COLUMN likes INT DEFAULT 0`); } catch (e) {}
      try { await connection.query(`ALTER TABLE ideias ADD COLUMN dislikes INT DEFAULT 0`); } catch (e) {}
    } catch (e) {
      console.error("Aviso tabela ideias:", e.message);
    }

    // Tabela Votos Ideias
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS votos_ideias (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          ideia_id INT NOT NULL,
          tipo_voto VARCHAR(10) NOT NULL,
          UNIQUE KEY uq_usuario_ideia (usuario_id, ideia_id)
        )
      `);
    } catch (e) {}

    // Tabela Votos Projetos
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS votos_projetos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          projeto_id INT NOT NULL,
          tipo_voto VARCHAR(10) NOT NULL,
          UNIQUE KEY uq_usuario_projeto (usuario_id, projeto_id)
        )
      `);
    } catch (e) {}

    // Tabela Mensagens / Chat
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS mensagens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          projeto_id INT NOT NULL,
          remetente VARCHAR(255),
          mensagem TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      try { await connection.query("ALTER TABLE mensagens ADD COLUMN mensagem TEXT;"); } catch (e) {}
      try { await connection.query("ALTER TABLE mensagens ADD COLUMN conteudo TEXT;"); } catch (e) {}
      try { await connection.query("ALTER TABLE mensagens ADD COLUMN remetente VARCHAR(255);"); } catch (e) {}
      try { await connection.query("ALTER TABLE mensagens ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"); } catch (e) {}
    } catch (e) {
      console.error("Aviso no ajuste da tabela mensagens:", e.message);
    }

    // Tabela Lojas
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS lojas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome_loja VARCHAR(255),
          usuario_id INT,
          banner_estilo VARCHAR(50),
          vitrine_estilo VARCHAR(50),
          rodape_estilo VARCHAR(50),
          cor_primaria VARCHAR(20) DEFAULT '#10b981',
          cor_secundaria VARCHAR(20) DEFAULT '#0f172a',
          cor_terciaria VARCHAR(20) DEFAULT '#ffffff',
          data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e) {}

    // Atualizações legadas
    try {
      await connection.query("UPDATE projetos SET status = 'aprovado' WHERE status IS NULL OR status = '';");
      await connection.query("UPDATE ideias SET status = 'aprovado' WHERE status IS NULL OR status = '';");
    } catch (e) {}

    console.log("✅ Banco de dados inicializado com sucesso.");
  } catch (err) {
    console.error("⚠️ Erro geral na conexão da inicialização do banco:", err.message);
  } finally {
    if (connection) connection.release();
  }
}

// --- ROTAS DA API ---

// CADASTRO
app.post(["/cadastro", "/api/cadastro"], async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha || !nome.trim() || !email.trim() || !senha.trim()) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
  }

  const emailNormalizado = email.trim().toLowerCase();
  try {
    const [existentes] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [emailNormalizado]);
    if (existentes.length > 0) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado" });
    }

    const saltRounds = 10;
    const hashSenha = await bcrypt.hash(senha, saltRounds);

    await pool.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, 'cliente')",
      [nome.trim(), emailNormalizado, hashSenha]
    );

    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (err) {
    console.error("Erro ao realizar cadastro:", err);
    res.status(500).json({ error: "Erro interno do servidor ao cadastrar usuário" });
  }
});

// LOGIN
app.post(["/login", "/api/login"], async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  const emailNormalizado = email.trim().toLowerCase();
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [emailNormalizado]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const usuario = rows[0];
    let senhaCorreta = false;
    const senhaSalva = usuario.senha;
    const ehBcrypt = senhaSalva && (senhaSalva.startsWith("$2a$") || senhaSalva.startsWith("$2b$") || senhaSalva.startsWith("$2y$"));

    if (ehBcrypt) {
      senhaCorreta = await bcrypt.compare(senha, senhaSalva);
    } else {
      senhaCorreta = (senha === senhaSalva);
      if (senhaCorreta) {
        try {
          const hashNovo = await bcrypt.hash(senha, 10);
          await pool.query("UPDATE usuarios SET senha = ? WHERE id = ?", [hashNovo, usuario.id]);
        } catch (e) {}
      }
    }

    if (!senhaCorreta) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const tokenPayload = { id: usuario.id, email: usuario.email, nivel: usuario.nivel };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      message: "Login realizado com sucesso",
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel }
    });
  } catch (err) {
    console.error("Erro ao realizar login:", err);
    res.status(500).json({ error: "Erro interno do servidor ao fazer login" });
  }
});

// LISTAGEM PÚBLICA DE PROJETOS APROVADOS (Com Votos e Status de Voto do Usuário Logado)
app.get(["/projetos", "/api/projetos"], autenticarToken, async (req, res) => {
  const usuario_id = req.usuario?.id || 0;
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        COALESCE(v_agg.likes, p.likes, 0) AS likes,
        COALESCE(v_agg.dislikes, p.dislikes, 0) AS dislikes,
        MAX(CASE WHEN v.usuario_id = ? THEN v.tipo_voto ELSE NULL END) AS meu_voto
      FROM projetos p
      LEFT JOIN votos_projetos v ON p.id = v.projeto_id
      LEFT JOIN (
        SELECT 
          projeto_id,
          SUM(CASE WHEN tipo_voto = 'like' THEN 1 ELSE 0 END) AS likes,
          SUM(CASE WHEN tipo_voto = 'dislike' THEN 1 ELSE 0 END) AS dislikes
        FROM votos_projetos
        GROUP BY projeto_id
      ) v_agg ON p.id = v_agg.projeto_id
      WHERE p.status = 'aprovado' OR p.status IS NULL OR p.status = ''
      GROUP BY p.id
      ORDER BY p.id DESC
    `, [usuario_id]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar projetos com agregador de votos:", err.message);
    try {
      const [rowsSimples] = await pool.query(`
        SELECT 
          p.*,
          COALESCE(p.likes, 0) AS likes,
          COALESCE(p.dislikes, 0) AS dislikes
        FROM projetos p 
        WHERE p.status = 'aprovado' OR p.status IS NULL OR p.status = '' 
        ORDER BY p.id DESC
      `);
      res.json(rowsSimples);
    } catch (e) {
      res.status(500).json({ error: "Erro interno ao listar projetos" });
    }
  }
});

// DETALHES DE UM PROJETO POR ID
app.get(["/projetos/:id", "/api/projetos/:id"], autenticarToken, async (req, res) => {
  const projeto_id = parseInt(req.params.id, 10);
  const usuario_id = req.usuario?.id || 0;

  if (isNaN(projeto_id)) {
    return res.status(400).json({ error: "ID de projeto inválido" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        COALESCE(SUM(CASE WHEN v.tipo_voto = 'like' THEN 1 ELSE 0 END), p.likes, 0) AS likes,
        COALESCE(SUM(CASE WHEN v.tipo_voto = 'dislike' THEN 1 ELSE 0 END), p.dislikes, 0) AS dislikes,
        MAX(CASE WHEN v.usuario_id = ? THEN v.tipo_voto ELSE NULL END) AS meu_voto
      FROM projetos p
      LEFT JOIN votos_projetos v ON p.id = v.projeto_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [usuario_id, projeto_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar detalhes do projeto:", err);
    res.status(500).json({ error: "Erro interno ao buscar projeto" });
  }
});

// CRIAÇÃO DE PROJETO
app.post(["/projetos", "/api/projetos"], async (req, res) => {
  const { 
    empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, 
    email_contato, email, telefone, imagem_url, status,
    eh_filial, is_filial, marca_principal, estado_filial, cidade_filial, valor_repasse
  } = req.body;

  try {
    const valorNum = (valor !== undefined && valor !== null && valor !== '') ? parseFloat(valor) : 0;
    const porcentagemNum = (porcentagem !== undefined && porcentagem !== null && porcentagem !== '') ? parseInt(porcentagem, 10) : 0;
    const usrId = usuario_id ? parseInt(usuario_id, 10) : null;
    const destEmail = email_contato || email || null;
    const tel = telefone || null;
    const img = imagem_url || null;
    const st = status || 'pendente';

    const ehFilialVal = (eh_filial === true || eh_filial === 'true' || eh_filial === 1 || is_filial === true || is_filial === 'true' || is_filial === 1) ? 1 : 0;
    const marcaPrincipalVal = marca_principal ? String(marca_principal).trim() : null;
    const estadoFilialVal = estado_filial ? String(estado_filial).trim() : null;
    const cidadeFilialVal = cidade_filial ? String(cidade_filial).trim() : null;
    const valorRepasseVal = (valor_repasse !== undefined && valor_repasse !== null && valor_repasse !== '') ? parseFloat(valor_repasse) : null;

    await pool.query(
      `INSERT INTO projetos (
        empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, 
        email_contato, telefone, imagem_url, status, likes, dislikes,
        eh_filial, marca_principal, estado_filial, cidade_filial, valor_repasse
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?)`,
      [
        empresa || '',
        estado || '',
        cidade || '',
        nicho || '',
        descricao || '',
        valorNum,
        porcentagemNum,
        usrId,
        destEmail,
        tel,
        img,
        st,
        ehFilialVal,
        marcaPrincipalVal,
        estadoFilialVal,
        cidadeFilialVal,
        valorRepasseVal
      ]
    );

    if (destEmail) {
      enviarEmailRecebimento(destEmail, empresa || 'Novo Projeto', 'projeto');
    }

    res.json({ message: "Projeto enviado para análise com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao cadastrar projeto:", err);
    res.status(500).json({ error: "Erro interno ao cadastrar projeto", details: err.message });
  }
});

// VOTAÇÃO EM PROJETOS (HANDLERS SUPORTANDO VÁRIAS ROTAS E VERBOS HTTP)
const votarProjetoHandler = async (req, res) => {
  const projeto_id = parseInt(req.params.id, 10);
  const usuario_id = req.usuario?.id;

  if (isNaN(projeto_id)) {
    return res.status(400).json({ error: "ID do projeto inválido." });
  }

  if (!usuario_id) {
    return res.status(401).json({ error: "Você precisa estar conectado para votar." });
  }

  let tipo = req.body.tipo || req.body.voto || req.body.tipo_voto;
  const path = req.path.toLowerCase();
  if (path.endsWith('/like')) {
    tipo = 'like';
  } else if (path.endsWith('/dislike')) {
    tipo = 'dislike';
  }

  if (tipo !== 'like' && tipo !== 'dislike') {
    return res.status(400).json({ error: "Tipo de voto inválido. Use 'like' ou 'dislike'." });
  }

  try {
    // 1. Verificar existência do projeto
    const [projetos] = await pool.query("SELECT * FROM projetos WHERE id = ?", [projeto_id]);
    if (projetos.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado." });
    }

    // 2. Verificar voto existente do usuário
    const [existente] = await pool.query(
      "SELECT id, tipo_voto FROM votos_projetos WHERE usuario_id = ? AND projeto_id = ?",
      [usuario_id, projeto_id]
    );

    if (existente.length > 0) {
      if (existente[0].tipo_voto === tipo) {
        // Toggle OFF se votou no mesmo tipo
        await pool.query("DELETE FROM votos_projetos WHERE id = ?", [existente[0].id]);
      } else {
        // Altera para o novo tipo
        await pool.query("UPDATE votos_projetos SET tipo_voto = ? WHERE id = ?", [tipo, existente[0].id]);
      }
    } else {
      // Insere novo voto
      await pool.query(
        "INSERT INTO votos_projetos (usuario_id, projeto_id, tipo_voto) VALUES (?, ?, ?)",
        [usuario_id, projeto_id, tipo]
      );
    }

    // 3. Recalcula os totais de likes e dislikes
    const [contagem] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN tipo_voto = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN tipo_voto = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes
      FROM votos_projetos 
      WHERE projeto_id = ?
    `, [projeto_id]);

    const totalLikes = Number(contagem[0]?.likes || 0);
    const totalDislikes = Number(contagem[0]?.dislikes || 0);

    // 4. Atualiza a tabela `projetos` para garantir sincronia no banco de dados
    try {
      await pool.query(
        "UPDATE projetos SET likes = ?, dislikes = ? WHERE id = ?",
        [totalLikes, totalDislikes, projeto_id]
      );
    } catch (eCol) {
      console.warn("Aviso ao atualizar colunas likes/dislikes em projetos:", eCol.message);
    }

    // 5. Obtém o estado do voto do perfil do usuário logado
    const [votoPerfil] = await pool.query(
      "SELECT tipo_voto FROM votos_projetos WHERE usuario_id = ? AND projeto_id = ?",
      [usuario_id, projeto_id]
    );
    const meuVoto = votoPerfil.length > 0 ? votoPerfil[0].tipo_voto : null;

    // 6. Obtém o objeto completo do projeto atualizado
    const [projetoRows] = await pool.query("SELECT * FROM projetos WHERE id = ?", [projeto_id]);
    const projetoAtualizado = projetoRows[0] || {};
    projetoAtualizado.likes = totalLikes;
    projetoAtualizado.dislikes = totalDislikes;
    projetoAtualizado.meu_voto = meuVoto;

    res.json({
      message: "Voto registrado com sucesso!",
      likes: totalLikes,
      dislikes: totalDislikes,
      meu_voto: meuVoto,
      projeto: projetoAtualizado
    });
  } catch (err) {
    console.error("Erro ao registrar voto no projeto:", err);
    res.status(500).json({ error: "Erro interno ao registrar voto", details: err.message });
  }
};

const rotasVotoProjeto = [
  "/projetos/:id/votar", "/api/projetos/:id/votar",
  "/projetos/:id/like", "/api/projetos/:id/like",
  "/projetos/:id/dislike", "/api/projetos/:id/dislike",
  "/projetos/:id/voto", "/api/projetos/:id/voto"
];

app.put(rotasVotoProjeto, autenticarToken, votarProjetoHandler);
app.post(rotasVotoProjeto, autenticarToken, votarProjetoHandler);

// LISTAGEM PÚBLICA DE IDEIAS APROVADAS
app.get(["/ideias", "/api/ideias"], autenticarToken, async (req, res) => {
  const usuario_id = req.usuario?.id || 0;
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        COALESCE(SUM(CASE WHEN v.tipo_voto = 'like' THEN 1 ELSE 0 END), i.likes, 0) AS likes,
        COALESCE(SUM(CASE WHEN v.tipo_voto = 'dislike' THEN 1 ELSE 0 END), i.dislikes, 0) AS dislikes,
        MAX(CASE WHEN v.usuario_id = ? THEN v.tipo_voto ELSE NULL END) AS meu_voto
      FROM ideias i
      LEFT JOIN votos_ideias v ON i.id = v.ideia_id
      WHERE i.status = 'aprovado' OR i.status IS NULL OR i.status = ''
      GROUP BY i.id
      ORDER BY i.id DESC
    `, [usuario_id]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar ideias com votos:", err.message);
    try {
      const [rowsSimples] = await pool.query("SELECT *, COALESCE(likes, 0) AS likes, COALESCE(dislikes, 0) AS dislikes FROM ideias WHERE status = 'aprovado' OR status IS NULL OR status = '' ORDER BY id DESC");
      res.json(rowsSimples);
    } catch (e) {
      res.status(500).json({ error: "Erro interno ao listar ideias" });
    }
  }
});

// CRIAÇÃO DE IDEIA
app.post(["/ideias", "/api/ideias"], async (req, res) => {
  const { titulo, nicho, descricao, email_contato, email } = req.body;
  try {
    await pool.query(
      "INSERT INTO ideias (titulo, nicho, descricao, status, likes, dislikes) VALUES (?, ?, ?, 'pendente', 0, 0)",
      [titulo || '', nicho || '', descricao || '']
    );

    const destEmail = email_contato || email;
    if (destEmail) {
      enviarEmailRecebimento(destEmail, titulo || 'Nova Ideia', 'ideia');
    }

    res.json({ message: "Ideia enviada para análise com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar ideia:", err);
    res.status(500).json({ error: "Erro interno ao cadastrar ideia" });
  }
});

// VOTAÇÃO EM IDEIAS
const votarIdeiaHandler = async (req, res) => {
  const ideia_id = parseInt(req.params.id, 10);
  const usuario_id = req.usuario?.id;

  if (isNaN(ideia_id)) {
    return res.status(400).json({ error: "ID da ideia inválido." });
  }

  if (!usuario_id) {
    return res.status(401).json({ error: "Você precisa estar conectado para votar." });
  }

  let tipo = req.body.tipo || req.body.voto || req.body.tipo_voto;
  const path = req.path.toLowerCase();
  if (path.endsWith('/like')) {
    tipo = 'like';
  } else if (path.endsWith('/dislike')) {
    tipo = 'dislike';
  }

  if (tipo !== 'like' && tipo !== 'dislike') {
    return res.status(400).json({ error: "Tipo de voto inválido. Use 'like' ou 'dislike'." });
  }

  try {
    const [existente] = await pool.query(
      "SELECT id, tipo_voto FROM votos_ideias WHERE usuario_id = ? AND ideia_id = ?",
      [usuario_id, ideia_id]
    );

    if (existente.length > 0) {
      if (existente[0].tipo_voto === tipo) {
        await pool.query("DELETE FROM votos_ideias WHERE id = ?", [existente[0].id]);
      } else {
        await pool.query("UPDATE votos_ideias SET tipo_voto = ? WHERE id = ?", [tipo, existente[0].id]);
      }
    } else {
      await pool.query(
        "INSERT INTO votos_ideias (usuario_id, ideia_id, tipo_voto) VALUES (?, ?, ?)",
        [usuario_id, ideia_id, tipo]
      );
    }

    const [contagem] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN tipo_voto = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN tipo_voto = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes
      FROM votos_ideias 
      WHERE ideia_id = ?
    `, [ideia_id]);

    const totalLikes = Number(contagem[0]?.likes || 0);
    const totalDislikes = Number(contagem[0]?.dislikes || 0);

    try {
      await pool.query(
        "UPDATE ideias SET likes = ?, dislikes = ? WHERE id = ?",
        [totalLikes, totalDislikes, ideia_id]
      );
    } catch (eCol) {}

    const [votoPerfil] = await pool.query(
      "SELECT tipo_voto FROM votos_ideias WHERE usuario_id = ? AND ideia_id = ?",
      [usuario_id, ideia_id]
    );
    const meuVoto = votoPerfil.length > 0 ? votoPerfil[0].tipo_voto : null;

    const [ideiaRows] = await pool.query("SELECT * FROM ideias WHERE id = ?", [ideia_id]);
    const ideiaAtualizada = ideiaRows[0] || {};
    ideiaAtualizada.likes = totalLikes;
    ideiaAtualizada.dislikes = totalDislikes;
    ideiaAtualizada.meu_voto = meuVoto;

    res.json({
      message: "Voto registrado com sucesso!",
      likes: totalLikes,
      dislikes: totalDislikes,
      meu_voto: meuVoto,
      ideia: ideiaAtualizada
    });
  } catch (err) {
    console.error("Erro ao registrar voto na ideia:", err);
    res.status(500).json({ error: "Erro interno ao registrar voto" });
  }
};

const rotasVotoIdeia = [
  "/ideias/:id/votar", "/api/ideias/:id/votar",
  "/ideias/:id/like", "/api/ideias/:id/like",
  "/ideias/:id/dislike", "/api/ideias/:id/dislike",
  "/ideias/:id/voto", "/api/ideias/:id/voto"
];

app.put(rotasVotoIdeia, autenticarToken, votarIdeiaHandler);
app.post(rotasVotoIdeia, autenticarToken, votarIdeiaHandler);

// CHAT / MENSAGENS HANDLERS
const enviarMensagemHandler = async (req, res) => {
  const { projeto_id, destinatario_id, destinatario, usuario_id, remetente, mensagem } = req.body;
  const textoMensagem = mensagem ? String(mensagem).trim() : '';

  if (!projeto_id || !textoMensagem) {
    return res.status(400).json({ error: "Dados incompletos para envio de mensagem." });
  }

  const projId = parseInt(projeto_id, 10);
  if (isNaN(projId)) {
    return res.status(400).json({ error: "ID do projeto inválido." });
  }

  const idRemetente = req.usuario?.id || usuario_id || 0;
  const idDestinatario = parseInt(destinatario_id, 10) || 0;
  const nomeDestinatario = (destinatario || '').trim();
  const nomeRemetente = req.usuario?.nome || remetente || 'Usuário';

  console.log(`[Chat 1-para-1] Mensagem para projeto #${projId}: "${textoMensagem.substring(0, 30)}"`);

  // Garante a criação da tabela e colunas necessárias
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensagens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT NOT NULL,
        remetente VARCHAR(255),
        mensagem TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (tErr) {}

  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN mensagem TEXT`); } catch (e) {}
  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN conteudo TEXT`); } catch (e) {}
  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN remetente VARCHAR(255)`); } catch (e) {}
  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN remetente_id INT DEFAULT 0`); } catch (e) {}
  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN destinatario_id INT DEFAULT 0`); } catch (e) {}
  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN destinatario VARCHAR(255)`); } catch (e) {}
  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN usuario_id INT DEFAULT 0`); } catch (e) {}

  try {
    await pool.query(
      "INSERT INTO mensagens (projeto_id, remetente, mensagem, remetente_id, usuario_id, destinatario_id, destinatario) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [projId, nomeRemetente, textoMensagem, idRemetente, idRemetente, idDestinatario, nomeDestinatario]
    );
    console.log(`✅ Mensagem 1-para-1 salva no projeto #${projId}`);
    return res.status(201).json({ message: "Mensagem enviada com sucesso!" });
  } catch (err1) {
    try {
      await pool.query(
        "INSERT INTO mensagens (projeto_id, remetente, mensagem, remetente_id, destinatario_id) VALUES (?, ?, ?, ?, ?)",
        [projId, nomeRemetente, textoMensagem, idRemetente, idDestinatario]
      );
      return res.status(201).json({ message: "Mensagem enviada com sucesso!" });
    } catch (err2) {
      try {
        await pool.query(
          "INSERT INTO mensagens (projeto_id, remetente, mensagem) VALUES (?, ?, ?)",
          [projId, nomeRemetente, textoMensagem]
        );
        return res.status(201).json({ message: "Mensagem enviada com sucesso!" });
      } catch (err3) {
        return res.status(500).json({ error: "Erro ao salvar mensagem", details: err3.message });
      }
    }
  }
};

const buscarMensagensHandler = async (req, res) => {
  const { projeto_id } = req.params;
  const projId = parseInt(projeto_id, 10);

  if (isNaN(projId)) {
    return res.status(400).json({ error: "ID do projeto inválido." });
  }

  const userId = req.usuario?.id || 0;
  const userNome = req.usuario?.nome ? req.usuario.nome.trim().toLowerCase() : '';
  const isAdmin = req.usuario?.nivel === 'admin';

  // Identificador do participante/investidor da conversa 1-para-1
  const queryInvestidorId = parseInt(
    req.query.participante_id || req.query.investidor_id || req.query.interlocutor_id, 10
  ) || 0;

  const queryInvestidorNome = (
    req.query.participante_nome || req.query.investidor_nome || req.query.interlocutor_nome || req.query.remetente || ''
  ).trim().toLowerCase();

  try {
    // 1. Obter dono do projeto
    const [donoRows] = await pool.query("SELECT usuario_id FROM projetos WHERE id = ?", [projId]);
    if (donoRows.length === 0) return res.json([]);
    const donoId = Number(donoRows[0].usuario_id || 0);

    const ehDono = userId > 0 && donoId > 0 && userId === donoId;

    // 2. Buscar todas as mensagens do projeto no MySQL
    const [todasMensagens] = await pool.query(`
      SELECT 
        m.id,
        m.projeto_id,
        COALESCE(m.remetente, u.nome, 'Usuário') AS remetente_nome,
        COALESCE(m.remetente, '') AS remetente,
        COALESCE(m.remetente_id, m.usuario_id, 0) AS remetente_id,
        COALESCE(m.destinatario_id, 0) AS destinatario_id,
        COALESCE(m.destinatario, '') AS destinatario,
        COALESCE(m.usuario_id, 0) AS usuario_id,
        COALESCE(m.mensagem, m.conteudo, m.texto, '') AS mensagem,
        COALESCE(m.created_at, m.data_envio, CURRENT_TIMESTAMP) AS data_envio
      FROM mensagens m
      LEFT JOIN usuarios u ON (m.remetente_id = u.id OR m.usuario_id = u.id)
      WHERE m.projeto_id = ?
      ORDER BY m.id ASC
    `, [projId]);

    if (todasMensagens.length === 0) {
      return res.json([]);
    }

    // 3. Filtrar ESTRITAMENTE a conversa 1-para-1 do participante selecionado
    const mensagensFiltradas = todasMensagens.filter(m => {
      const remId = Number(m.remetente_id || m.usuario_id || 0);
      const destId = Number(m.destinatario_id || 0);
      const remNome = (m.remetente_nome || m.remetente || '').trim().toLowerCase();
      const destNome = (m.destinatario || '').trim().toLowerCase();

      // CASO A: O usuário logado é um INVESTIDOR comum (não-dono e não-admin)
      if (!ehDono && !isAdmin) {
        const ehRem = (userId > 0 && remId === userId) || (userNome && (remNome === userNome || remNome.includes(userNome)));
        const ehDest = (userId > 0 && destId === userId) || (userNome && (destNome === userNome || destNome.includes(userNome)));
        
        if (destId === 0 && !destNome) {
          // Em histórico antigo sem destinatario gravado: aceita msgs do investidor ou msgs de resposta no projeto
          return ehRem || (remId === donoId) || (remId === 0);
        }
        return ehRem || ehDest;
      }

      // CASO B: O usuário logado é o DONO DO PROJETO ou ADMIN
      // O frontend passou qual investidor foi selecionado na barra lateral:
      if (queryInvestidorId > 0) {
        if (remId === queryInvestidorId || destId === queryInvestidorId) {
          return true;
        }
      }

      if (queryInvestidorNome) {
        const bateuRemetente = remNome && (remNome === queryInvestidorNome || remNome.includes(queryInvestidorNome) || queryInvestidorNome.includes(remNome));
        const bateuDestinatario = destNome && (destNome === queryInvestidorNome || destNome.includes(queryInvestidorNome) || queryInvestidorNome.includes(destNome));
        
        if (bateuRemetente || bateuDestinatario) {
          return true;
        }

        // Suporte a dados legados onde o dono respondeu sem preencher destinatario explícito:
        if (remId === donoId && destId === 0 && !destNome) {
          return true;
        }
      }

      // Se nenhum participante foi especificado (ex: admin visualizando chat sem filtros)
      if (!queryInvestidorId && !queryInvestidorNome) {
        return true;
      }

      return false;
    });

    res.json(mensagensFiltradas);
  } catch (err) {
    console.warn("⚠️ Busca de mensagens 1-para-1 falhou:", err.message);
    res.json([]);
  }
};

const minhasConversasHandler = async (req, res) => {
  const userId = parseInt(req.params.usuario_id, 10) || req.usuario?.id || 0;
  const userNome = req.usuario?.nome ? req.usuario.nome.trim() : '';
  const isAdmin = req.usuario?.nivel === 'admin';

  if (!userId && !userNome && !isAdmin) {
    return res.json([]);
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id AS msg_id,
        m.projeto_id,
        p.empresa,
        p.nicho,
        p.valor,
        p.porcentagem,
        p.usuario_id AS dono_id,
        m.remetente_id,
        m.usuario_id AS msg_usuario_id,
        m.destinatario_id,
        COALESCE(m.remetente, u.nome, 'Usuário') AS remetente_nome,
        COALESCE(m.mensagem, m.conteudo, '') AS mensagem,
        COALESCE(m.created_at, m.data_envio, CURRENT_TIMESTAMP) AS data_envio
      FROM mensagens m
      INNER JOIN projetos p ON m.projeto_id = p.id
      LEFT JOIN usuarios u ON (m.remetente_id = u.id OR m.usuario_id = u.id)
      ORDER BY m.id ASC
    `);

    // Agrupa mensagens em threads 1-para-1 separando cada investidor
    const conversasMap = new Map();

    for (const r of rows) {
      const donoId = Number(r.dono_id || 0);
      const remId = Number(r.remetente_id || r.msg_usuario_id || 0);
      const destId = Number(r.destinatario_id || 0);
      const remNome = (r.remetente_nome || '').trim();

      // Identifica quem é o investidor (participante não-dono)
      let investidorId = 0;
      let investidorNome = 'Investidor';

      if (donoId > 0) {
        if (remId > 0 && remId !== donoId) {
          investidorId = remId;
          investidorNome = remNome;
        } else if (destId > 0 && destId !== donoId) {
          investidorId = destId;
        } else if (remId === donoId && destId > 0) {
          investidorId = destId;
        }
      }

      if (investidorId === 0 && remId === 0 && remNome) {
        investidorNome = remNome;
      }

      // Validação de Permissão de Acesso por thread 1-para-1
      const ehDono = userId > 0 && donoId > 0 && userId === donoId;
      const ehInvestidor = (userId > 0 && investidorId > 0 && userId === investidorId) ||
                           (userId > 0 && remId > 0 && userId === remId) ||
                           (userNome && remNome.toLowerCase() === userNome.toLowerCase());

      if (!isAdmin && !ehDono && !ehInvestidor) {
        continue; // Descarta conversas de terceiros
      }

      // Donos de projetos vêm "NomeDoProjeto - NomeDoInvestidor", investidores vêm "NomeDoProjeto"
      const tituloDisplay = (ehDono && investidorNome && investidorNome !== 'Investidor')
        ? `${r.empresa} - ${investidorNome}`
        : r.empresa;

      const chaveInvestidor = investidorId > 0 ? `id_${investidorId}` : `nome_${investidorNome.toLowerCase()}`;
      const conversaKey = `${r.projeto_id}_${chaveInvestidor}`;

      const conversaObj = {
        conversa_key: conversaKey,
        projeto_id: r.projeto_id,
        empresa: tituloDisplay,
        empresa_original: r.empresa,
        nicho: r.nicho,
        valor: r.valor,
        porcentagem: r.porcentagem,
        dono_id: donoId,
        investidor_id: investidorId,
        investidor_nome: investidorNome,
        ultima_msg: r.mensagem,
        autor_nome: r.remetente_nome,
        ultima_data: r.data_envio
      };

      conversasMap.set(conversaKey, conversaObj);
    }

    const listaConversas = Array.from(conversasMap.values()).sort(
      (a, b) => new Date(b.ultima_data) - new Date(a.ultima_data)
    );

    res.json(listaConversas);
  } catch (err) {
    console.error("Erro ao buscar conversas 1-para-1:", err.message);
    res.json([]);
  }
};

const rotasMensagensEnviar = ["/mensagens", "/api/mensagens", "/chat", "/api/chat"];
app.post(rotasMensagensEnviar, autenticarToken, enviarMensagemHandler);

const rotasMensagensBuscar = ["/mensagens/:projeto_id", "/api/mensagens/:projeto_id", "/chat/:projeto_id", "/api/chat/:projeto_id"];
app.get(rotasMensagensBuscar, autenticarToken, buscarMensagensHandler);

const rotasMinhasConversas = [
  "/minhas-conversas", "/api/minhas-conversas",
  "/minhas-conversas/:usuario_id", "/api/minhas-conversas/:usuario_id",
  "/conversas", "/api/conversas",
  "/conversas/usuario", "/api/conversas/usuario",
  "/mensagens/conversas", "/api/mensagens/conversas"
];
app.get(rotasMinhasConversas, autenticarToken, minhasConversasHandler);

// CRIAR LOJA BUILDER
app.post(["/lojas", "/api/lojas"], async (req, res) => {
  const { nome_loja, usuario_id, banner_estilo, vitrine_estilo, rodape_estilo, cor_primaria, cor_secundaria, cor_terciaria } = req.body;
  try {
    await pool.query(
      `INSERT INTO lojas (nome_loja, usuario_id, banner_estilo, vitrine_estilo, rodape_estilo, cor_primaria, cor_secundaria, cor_terciaria) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_loja || 'Minha Loja CoNexo',
        usuario_id || null,
        banner_estilo || 'estatico',
        vitrine_estilo || 'grid',
        rodape_estilo || 'compacto',
        cor_primaria || '#10b981',
        cor_secundaria || '#0f172a',
        cor_terciaria || '#ffffff'
      ]
    );

    res.json({ message: "Configuração da loja salva com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar loja:", err);
    res.status(500).json({ error: "Erro interno ao salvar loja" });
  }
});

// ADMIN: PENDENTES
app.get(["/admin/pendentes", "/api/admin/pendentes"], async (req, res) => {
  try {
    const [projetos] = await pool.query("SELECT *, 'projeto' as tipo_item FROM projetos WHERE status = 'pendente'");
    const [ideias] = await pool.query("SELECT *, 'ideia' as tipo_item FROM ideias WHERE status = 'pendente'");
    res.json([...projetos, ...ideias]);
  } catch (err) {
    console.error("Erro ao carregar pendentes:", err);
    res.status(500).json({ error: "Erro ao carregar pendentes" });
  }
});

// ADMIN: LOJAS
app.get(["/admin/lojas", "/api/admin/lojas"], async (req, res) => {
  try {
    const [lojas] = await pool.query(`
      SELECT 
        l.*, 
        u.nome AS usuario_nome, 
        u.email AS usuario_email 
      FROM lojas l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      ORDER BY l.id DESC
    `);
    res.json(lojas);
  } catch (err) {
    console.error("Erro ao carregar lojas no admin:", err);
    res.status(500).json({ error: "Erro ao carregar lojas" });
  }
});

// ADMIN: APROVAR
app.put(["/admin/aprovar/:id", "/api/admin/aprovar/:id"], async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;
  const tabela = (tipo === 'ideia') ? 'ideias' : 'projetos';

  try {
    let emailDestino = null;
    let tituloItem = "";

    if (tabela === 'projetos') {
      const [rows] = await pool.query("SELECT email_contato, empresa FROM projetos WHERE id = ?", [id]);
      if (rows.length > 0) {
        emailDestino = rows[0].email_contato;
        tituloItem = rows[0].empresa;
      }
    } else {
      const [rows] = await pool.query("SELECT titulo FROM ideias WHERE id = ?", [id]);
      if (rows.length > 0) {
        tituloItem = rows[0].titulo;
      }
    }

    await pool.query(`UPDATE ${tabela} SET status = 'aprovado' WHERE id = ?`, [id]);

    if (emailDestino) {
      enviarEmailAprovacao(emailDestino, tituloItem, tipo);
    }

    res.json({ message: "Item aprovado com sucesso!" });
  } catch (err) {
    console.error("Erro ao aprovar item:", err);
    res.status(500).json({ error: "Erro interno ao aprovar item" });
  }
});

// DELETAR PROJETO
app.delete(["/projetos/:id", "/api/projetos/:id"], async (req, res) => {
  try {
    await pool.query("DELETE FROM votos_projetos WHERE projeto_id = ?", [req.params.id]);
    await pool.query("DELETE FROM mensagens WHERE projeto_id = ?", [req.params.id]);
    await pool.query("DELETE FROM projetos WHERE id = ?", [req.params.id]);
    res.json({ message: "Projeto excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir projeto:", err);
    res.status(500).json({ error: "Erro interno ao excluir projeto" });
  }
});

// DELETAR IDEIA
app.delete(["/ideias/:id", "/api/ideias/:id"], async (req, res) => {
  try {
    await pool.query("DELETE FROM votos_ideias WHERE ideia_id = ?", [req.params.id]);
    await pool.query("DELETE FROM ideias WHERE id = ?", [req.params.id]);
    res.json({ message: "Ideia excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir ideia:", err);
    res.status(500).json({ error: "Erro interno ao excluir ideia" });
  }
});

// DELETAR LOJA
app.delete(["/admin/lojas/:id", "/api/admin/lojas/:id"], async (req, res) => {
  try {
    await pool.query("DELETE FROM lojas WHERE id = ?", [req.params.id]);
    res.json({ message: "Loja excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir loja:", err);
    res.status(500).json({ error: "Erro interno ao excluir loja" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  await inicializarBanco();
});