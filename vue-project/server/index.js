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

// Configuração da conexão com o banco de dados MySQL (Aiven)
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

    // Tabela Projetos
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
          status VARCHAR(20) DEFAULT 'pendente'
        )
      `);
      await connection.query(`ALTER TABLE projetos MODIFY COLUMN imagem_url LONGTEXT`);
    } catch (e) {}

    // Tabela Ideias
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS ideias (
          id INT AUTO_INCREMENT PRIMARY KEY, 
          titulo VARCHAR(255), 
          nicho VARCHAR(100), 
          descricao TEXT, 
          data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
          status VARCHAR(20) DEFAULT 'pendente'
        )
      `);
      await connection.query(`ALTER TABLE ideias ADD COLUMN status VARCHAR(20) DEFAULT 'pendente'`);
    } catch (e) {}

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

    // Tabela Mensagens / Chat (Estrutura Exata com Colunas Garantidas)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS mensagens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          projeto_id INT NOT NULL,
          remetente VARCHAR(255),
          mensagem TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tenta adicionar a coluna caso a tabela já exista sem ela
      try {
        await connection.query("ALTER TABLE mensagens ADD COLUMN mensagem TEXT;");
      } catch (e) {}
      try {
        await connection.query("ALTER TABLE mensagens ADD COLUMN conteudo TEXT;");
      } catch (e) {}
      try {
        await connection.query("ALTER TABLE mensagens ADD COLUMN remetente VARCHAR(255);");
      } catch (e) {}
      try {
        await connection.query("ALTER TABLE mensagens ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
      } catch (e) {}
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
app.post("/cadastro", async (req, res) => {
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
app.post("/login", async (req, res) => {
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

// LISTAGEM PÚBLICA DE PROJETOS APROVADOS
app.get("/projetos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projetos WHERE status = 'aprovado' OR status IS NULL OR status = '' ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar projetos:", err);
    res.status(500).json({ error: "Erro interno ao listar projetos" });
  }
});

// CRIAÇÃO DE PROJETO
app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, email, telefone, imagem_url, status } = req.body;

  try {
    const valorNum = (valor !== undefined && valor !== null && valor !== '') ? parseFloat(valor) : 0;
    const porcentagemNum = (porcentagem !== undefined && porcentagem !== null && porcentagem !== '') ? parseInt(porcentagem, 10) : 0;
    const usrId = usuario_id ? parseInt(usuario_id, 10) : null;
    const destEmail = email_contato || email || null;
    const tel = telefone || null;
    const img = imagem_url || null;
    const st = status || 'pendente';

    await pool.query(
      `INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone, imagem_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        st
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

// LISTAGEM PÚBLICA DE IDEIAS APROVADAS
app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        COALESCE(SUM(CASE WHEN v.tipo_voto = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN v.tipo_voto = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes
      FROM ideias i
      LEFT JOIN votos_ideias v ON i.id = v.ideia_id
      WHERE i.status = 'aprovado' OR i.status IS NULL OR i.status = ''
      GROUP BY i.id
      ORDER BY i.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar ideias com votos, tentando fallback simples:", err.message);
    try {
      const [rowsSimples] = await pool.query("SELECT * FROM ideias WHERE status = 'aprovado' OR status IS NULL OR status = '' ORDER BY id DESC");
      res.json(rowsSimples);
    } catch (e) {
      res.status(500).json({ error: "Erro interno ao listar ideias" });
    }
  }
});

// CRIAÇÃO DE IDEIA
app.post("/ideias", async (req, res) => {
  const { titulo, nicho, descricao, email_contato, email } = req.body;
  try {
    await pool.query(
      "INSERT INTO ideias (titulo, nicho, descricao, status) VALUES (?, ?, ?, 'pendente')",
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
app.put("/ideias/:id/votar", autenticarToken, async (req, res) => {
  const ideia_id = req.params.id;
  const usuario_id = req.usuario?.id;
  const { tipo } = req.body;

  if (!usuario_id) {
    return res.status(401).json({ error: "Você precisa estar conectado para votar." });
  }

  if (tipo !== 'like' && tipo !== 'dislike') {
    return res.status(400).json({ error: "Tipo de voto inválido." });
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
        SUM(CASE WHEN tipo_voto = 'like' THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN tipo_voto = 'dislike' THEN 1 ELSE 0 END) AS dislikes
      FROM votos_ideias 
      WHERE ideia_id = ?
    `, [ideia_id]);

    const [votoPerfil] = await pool.query(
      "SELECT tipo_voto FROM votos_ideias WHERE usuario_id = ? AND ideia_id = ?",
      [usuario_id, ideia_id]
    );

    res.json({
      likes: Number(contagem[0]?.likes || 0),
      dislikes: Number(contagem[0]?.dislikes || 0),
      meu_voto: votoPerfil.length > 0 ? votoPerfil[0].tipo_voto : null
    });
  } catch (err) {
    console.error("Erro ao registrar voto:", err);
    res.status(500).json({ error: "Erro interno ao registrar voto" });
  }
});

// CHAT / MENSAGENS HANDLERS
const enviarMensagemHandler = async (req, res) => {
  const { projeto_id, destinatario_id, usuario_id, remetente, mensagem } = req.body;
  const textoMensagem = mensagem ? String(mensagem).trim() : '';

  if (!projeto_id || !textoMensagem) {
    return res.status(400).json({ error: "Dados incompletos para envio de mensagem." });
  }

  const projId = parseInt(projeto_id, 10);
  if (isNaN(projId)) {
    return res.status(400).json({ error: "ID do projeto inválido." });
  }

  const idRemetente = req.usuario?.id || usuario_id || 0;
  const nomeRemetente = req.usuario?.nome || remetente || 'Usuário';

  console.log(`[Chat] Recebida mensagem para projeto #${projId}: "${textoMensagem.substring(0, 30)}"`);

  // Garante a criação da tabela e da coluna 'mensagem' diretamente no handler antes de inserir
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
  try { await pool.query(`ALTER TABLE mensagens ADD COLUMN usuario_id INT DEFAULT 0`); } catch (e) {}

  try {
    await pool.query(
      "INSERT INTO mensagens (projeto_id, remetente, mensagem, remetente_id, usuario_id) VALUES (?, ?, ?, ?, ?)",
      [projId, nomeRemetente, textoMensagem, idRemetente, idRemetente]
    );
    console.log(`✅ Mensagem salva com sucesso no projeto #${projId}`);
    return res.status(201).json({ message: "Mensagem enviada com sucesso!" });
  } catch (err1) {
    console.error("Erro detalhado ao salvar mensagem (Tentativa 1):", err1.message);

    try {
      await pool.query(
        "INSERT INTO mensagens (projeto_id, remetente, mensagem) VALUES (?, ?, ?)",
        [projId, nomeRemetente, textoMensagem]
      );
      console.log(`✅ Mensagem salva via coluna simples no projeto #${projId}`);
      return res.status(201).json({ message: "Mensagem enviada com sucesso!" });
    } catch (err2) {
      console.error("Erro detalhado (Tentativa 2):", err2.message);

      try {
        await pool.query(
          "INSERT INTO mensagens (projeto_id, conteudo) VALUES (?, ?)",
          [projId, textoMensagem]
        );
        console.log(`✅ Mensagem salva via fallback 'conteudo' no projeto #${projId}`);
        return res.status(201).json({ message: "Mensagem enviada com sucesso!" });
      } catch (err3) {
        console.error("Erro detalhado final ao salvar mensagem:", err3);
        return res.status(500).json({
          error: "Erro ao salvar mensagem",
          details: err3.message
        });
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
  const userNome = req.usuario?.nome ? req.usuario.nome.trim() : '';
  const isAdmin = req.usuario?.nivel === 'admin';

  try {
    // 1. Obter dono do projeto
    const [donoRows] = await pool.query("SELECT usuario_id FROM projetos WHERE id = ?", [projId]);
    const donoId = donoRows.length > 0 ? donoRows[0].usuario_id : null;

    // 2. Verificar se o usuário logado participou da conversa no projeto
    let participou = false;
    if (userId || userNome) {
      const [partRows] = await pool.query(`
        SELECT id FROM mensagens 
        WHERE projeto_id = ? 
          AND (
            (remetente_id = ? AND remetente_id > 0)
            OR (usuario_id = ? AND usuario_id > 0)
            OR (destinatario_id = ? AND destinatario_id > 0)
            OR (LOWER(remetente) = LOWER(?) AND remetente IS NOT NULL AND remetente != '')
          )
        LIMIT 1
      `, [projId, userId, userId, userId, userNome]);
      
      if (partRows.length > 0) {
        participou = true;
      }
    }

    const ehDono = userId && donoId && (Number(userId) === Number(donoId));

    // Privacidade Rígida: se não for o autor do projeto, nem participante ativo, nem admin -> proíbe o acesso a conversas alheias
    if (!ehDono && !participou && !isAdmin) {
      return res.json([]);
    }

    const [mensagens] = await pool.query(`
      SELECT 
        m.id,
        m.projeto_id,
        COALESCE(m.remetente, u.nome, 'Usuário') AS remetente_nome,
        COALESCE(m.remetente, '') AS remetente,
        COALESCE(m.remetente_id, m.usuario_id, 0) AS remetente_id,
        COALESCE(m.usuario_id, 0) AS usuario_id,
        COALESCE(m.mensagem, m.conteudo, m.texto, '') AS mensagem,
        COALESCE(m.created_at, m.data_envio, CURRENT_TIMESTAMP) AS data_envio
      FROM mensagens m
      LEFT JOIN usuarios u ON (m.remetente_id = u.id OR m.usuario_id = u.id)
      WHERE m.projeto_id = ?
      ORDER BY m.id ASC
    `, [projId]);

    res.json(mensagens);
  } catch (err) {
    console.warn("⚠️ Busca completa de mensagens falhou:", err.message);
    res.json([]);
  }
};

const minhasConversasHandler = async (req, res) => {
  const userId = parseInt(req.params.usuario_id, 10) || req.usuario?.id || 0;
  const userNome = req.usuario?.nome ? req.usuario.nome.trim() : '';
  const isAdmin = req.usuario?.nivel === 'admin';

  // Se não autenticado nem admin -> sigilo total (retorna lista vazia)
  if (!userId && !userNome && !isAdmin) {
    return res.json([]);
  }

  try {
    let sql, params;

    if (isAdmin) {
      sql = `
        SELECT DISTINCT
          p.id AS projeto_id,
          p.empresa,
          p.nicho,
          p.valor,
          p.porcentagem,
          COALESCE(
            (SELECT m.mensagem FROM mensagens m WHERE m.projeto_id = p.id ORDER BY m.id DESC LIMIT 1),
            (SELECT m.conteudo FROM mensagens m WHERE m.projeto_id = p.id ORDER BY m.id DESC LIMIT 1),
            ''
          ) AS ultima_msg,
          COALESCE(
            (SELECT m.remetente FROM mensagens m WHERE m.projeto_id = p.id ORDER BY m.id DESC LIMIT 1),
            'Usuário'
          ) AS autor_nome,
          (SELECT MAX(m.created_at) FROM mensagens m WHERE m.projeto_id = p.id) AS ultima_data,
          (SELECT COUNT(*) FROM mensagens m WHERE m.projeto_id = p.id) AS total_mensagens
        FROM projetos p
        INNER JOIN mensagens m ON m.projeto_id = p.id
        ORDER BY ultima_data DESC
      `;
      params = [];
    } else {
      sql = `
        SELECT DISTINCT
          p.id AS projeto_id,
          p.empresa,
          p.nicho,
          p.valor,
          p.porcentagem,
          COALESCE(
            (SELECT m.mensagem FROM mensagens m WHERE m.projeto_id = p.id ORDER BY m.id DESC LIMIT 1),
            (SELECT m.conteudo FROM mensagens m WHERE m.projeto_id = p.id ORDER BY m.id DESC LIMIT 1),
            ''
          ) AS ultima_msg,
          COALESCE(
            (SELECT m.remetente FROM mensagens m WHERE m.projeto_id = p.id ORDER BY m.id DESC LIMIT 1),
            'Usuário'
          ) AS autor_nome,
          (SELECT MAX(m.created_at) FROM mensagens m WHERE m.projeto_id = p.id) AS ultima_data,
          (SELECT COUNT(*) FROM mensagens m WHERE m.projeto_id = p.id) AS total_mensagens
        FROM projetos p
        INNER JOIN mensagens m ON m.projeto_id = p.id
        WHERE (p.usuario_id = ? AND ? > 0)
           OR (m.remetente_id = ? AND ? > 0)
           OR (m.usuario_id = ? AND ? > 0)
           OR (m.destinatario_id = ? AND ? > 0)
           OR (LOWER(m.remetente) = LOWER(?) AND ? != '')
        ORDER BY ultima_data DESC
      `;
      params = [userId, userId, userId, userId, userId, userId, userId, userId, userNome, userNome];
    }

    const [conversas] = await pool.query(sql, params);
    res.json(conversas);
  } catch (err) {
    console.error("Erro ao buscar minhas conversas:", err.message);
    res.json([]);
  }
};

app.post("/mensagens", autenticarToken, enviarMensagemHandler);
app.post("/chat", autenticarToken, enviarMensagemHandler);

app.get("/mensagens/:projeto_id", autenticarToken, buscarMensagensHandler);
app.get("/chat/:projeto_id", autenticarToken, buscarMensagensHandler);

app.get("/minhas-conversas", autenticarToken, minhasConversasHandler);
app.get("/minhas-conversas/:usuario_id", autenticarToken, minhasConversasHandler);
app.get("/conversas", autenticarToken, minhasConversasHandler);
app.get("/conversas/usuario", autenticarToken, minhasConversasHandler);
app.get("/mensagens/conversas", autenticarToken, minhasConversasHandler);

// CRIAR LOJA BUILDER
app.post("/lojas", async (req, res) => {
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
app.get("/admin/pendentes", async (req, res) => {
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
app.get("/admin/lojas", async (req, res) => {
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
app.put("/admin/aprovar/:id", async (req, res) => {
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
app.delete("/projetos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM projetos WHERE id = ?", [req.params.id]);
    res.json({ message: "Projeto excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir projeto:", err);
    res.status(500).json({ error: "Erro interno ao excluir projeto" });
  }
});

// DELETAR IDEIA
app.delete("/ideias/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM ideias WHERE id = ?", [req.params.id]);
    res.json({ message: "Ideia excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir ideia:", err);
    res.status(500).json({ error: "Erro interno ao excluir ideia" });
  }
});

// DELETAR LOJA
app.delete("/admin/lojas/:id", async (req, res) => {
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