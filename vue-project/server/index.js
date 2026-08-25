require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// --- FUNÇÃO AUXILIAR DE ENVIO DE E-MAIL ---
async function enviarEmailAprovacao(emailDestino, tituloItem, tipo) {
  if (!emailDestino) {
    console.warn(`[E-mail] Não foi possível enviar e-mail de aprovação: destinatário não informado para o/a ${tipo} "${tituloItem}".`);
    return;
  }

  console.log('[E-mail] Enviando e-mail de aprovação para:', emailDestino);

  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn("[E-mail] Envio de e-mail abortado. As variáveis de ambiente EMAIL_USER e/ou EMAIL_PASS não estão configuradas.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const assunto = `Seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} foi aprovado na plataforma CoNexo!`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9c6e; margin-top: 0;">Parabéns!</h2>
        <p>Olá,</p>
        <p>Temos o prazer de informar que o seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} <strong>"${tituloItem}"</strong> foi aprovado(a) por um administrador.</p>
        <p>Ele(a) já está visível e disponível para todos os usuários na plataforma <strong>CoNexo</strong>.</p>
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

    console.log(`[E-mail] E-mail de aprovação enviado com sucesso para ${emailDestino} (${tipo}: "${tituloItem}").`);
  } catch (error) {
    console.error('[E-mail ERRO]:', error.message);
  }
}

// --- FUNÇÃO AUXILIAR DE RECEBIMENTO DE E-MAIL ---
async function enviarEmailRecebimento(emailDestino, tituloItem, tipo) {
  if (!emailDestino) {
    console.warn(`[E-mail] Não foi possível enviar e-mail de recebimento: destinatário não informado para o/a ${tipo} "${tituloItem}".`);
    return;
  }

  console.log('[E-mail] Enviando e-mail de recebimento para:', emailDestino);

  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn("[E-mail] Envio de e-mail de recebimento abortado. As variáveis de ambiente EMAIL_USER e/ou EMAIL_PASS não estão configuradas.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const assunto = `Recebemos o seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} na plataforma CoNexo!`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9c6e; margin-top: 0;">Recebido com Sucesso!</h2>
        <p>Olá,</p>
        <p>Confirmamos o recebimento do seu ${tipo === 'projeto' ? 'projeto' : 'ideia'} <strong>"${tituloItem}"</strong> na plataforma <strong>CoNexo</strong>.</p>
        <p>A equipe de administração irá analisar a sua publicação antes de colocá-la no ar. Entraremos em contato se precisarmos de mais informações.</p>
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

    console.log(`[E-mail] E-mail de recebimento enviado com sucesso para ${emailDestino} (${tipo}: "${tituloItem}").`);
  } catch (error) {
    console.error('[E-mail ERRO]:', error.message);
  }
}

// --- CONFIGURAÇÃO DE SEGURANÇA ---
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn("[Segurança] AVISO: JWT_SECRET não definido. Usando chave de desenvolvimento insegura. Defina JWT_SECRET no .env em produção!");
  return "dev_secret_inseguro_substitua_em_producao";
})();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// --- CONFIGURAÇÃO DE CORS ---
const configurarCors = () => {
  const origensPermitidas = process.env.ALLOWED_ORIGINS;

  if (!origensPermitidas) {
    console.warn("[Segurança] AVISO: ALLOWED_ORIGINS não definido. CORS permissivo ativo (apenas para desenvolvimento).");
    return cors();
  }

  const lista = origensPermitidas.split(',').map(o => o.trim()).filter(Boolean);
  return cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: Postman, curl, apps mobile)
      if (!origin || lista.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
};

const app = express();
app.use(express.json());
app.use(configurarCors());

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

// Inicialização das tabelas com correção automática de colunas
const inicializarBanco = async () => {
  try {
    // 1. Criação das tabelas (se não existirem)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        nome VARCHAR(255), 
        email VARCHAR(255) UNIQUE, 
        senha VARCHAR(255), 
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
        telefone VARCHAR(20), 
        status VARCHAR(20) DEFAULT 'pendente'
      )
    `);

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

    // 2. MIGRAÇÃO: Força a criação da coluna 'status' se a tabela já existia sem ela
    try {
      await pool.query("ALTER TABLE projetos ADD COLUMN status VARCHAR(20) DEFAULT 'pendente'");
      console.log("🆕 Coluna status adicionada em projetos!");
    } catch (e) {
      // Ignora erro se a coluna já existir
    }

    try {
      await pool.query("ALTER TABLE ideias ADD COLUMN status VARCHAR(20) DEFAULT 'pendente'");
      console.log("🆕 Coluna status adicionada em ideias!");
    } catch (e) {
      // Ignora erro se a coluna já existir
    }

    console.log("✅ Banco de dados pronto e atualizado!");
  } catch (err) { 
    console.error("❌ Erro inicialização:", err.message); 
  }
};

inicializarBanco();

// --- ROTAS DE CRIAÇÃO (POST) ---
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha || nome.trim() === "" || email.trim() === "" || senha.trim() === "") {
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
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/projetos", async (req, res) => {
  const { empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, email, telefone, status } = req.body;
  try {
    await pool.query(
      `INSERT INTO projetos (empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato, telefone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa, estado, cidade, nicho, descricao, valor, porcentagem, usuario_id, email_contato || email, telefone, status || 'pendente']
    );

    const destinatario = email_contato || email;
    if (destinatario) {
      enviarEmailRecebimento(destinatario, empresa, 'projeto');
    }

    res.json({ message: "Projeto enviado para análise!" });
  } catch (err) { 
    console.error("Erro ao cadastrar projeto:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

app.post("/ideias", async (req, res) => {
  const { titulo, nicho, descricao, email_contato, email } = req.body;
  try {
    await pool.query("INSERT INTO ideias (titulo, nicho, descricao, status) VALUES (?, ?, ?, 'pendente')", [titulo, nicho, descricao]);

    const destinatario = email_contato || email;
    if (destinatario) {
      enviarEmailRecebimento(destinatario, titulo, 'ideia');
    }

    res.json({ message: "Ideia enviada!" });
  } catch (err) { 
    console.error("Erro ao cadastrar ideia:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

// --- ROTAS PÚBLICAS (Filtra apenas aprovados para a Home) ---
app.get("/projetos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projetos WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(rows);
  } catch (err) { 
    console.error("Erro ao listar projetos:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

app.get("/ideias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ideias WHERE status = 'aprovado' ORDER BY id DESC");
    res.json(rows);
  } catch (err) { 
    console.error("Erro ao listar ideias:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

// --- MIDDLEWARES DE AUTENTICAÇÃO E AUTORIZAÇÃO ---

/**
 * autenticarToken: valida o JWT enviado no header Authorization: Bearer <token>
 * Se válido, adiciona o payload em req.usuario e chama next().
 */
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token não informado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido ou expirado" });
  }
};

/**
 * exigirAdmin: garante que o usuário autenticado possui nivel === 'admin'.
 * Deve ser usado após autenticarToken.
 */
const exigirAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.nivel !== 'admin') {
    return res.status(403).json({ error: "Acesso negado" });
  }
  next();
};

// --- ROTAS ADMIN ---
app.get("/admin/pendentes", autenticarToken, exigirAdmin, async (req, res) => {
  try {
    const [projetos] = await pool.query("SELECT *, 'projeto' as tipo_item FROM projetos WHERE status = 'pendente'");
    const [ideias] = await pool.query("SELECT *, 'ideia' as tipo_item FROM ideias WHERE status = 'pendente'");
    res.json([...projetos, ...ideias]);
  } catch (err) { 
    res.status(500).json({ error: "Erro ao buscar pendentes" }); 
  }
});

app.put("/admin/aprovar/:id", autenticarToken, exigirAdmin, async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body; // 'projeto' ou 'ideia'
  
  if (!tipo) {
    return res.status(400).json({ error: "Tipo do item não especificado." });
  }

  try {
    let emailDestino = null;
    let tituloItem = "";

    // Buscar informações de contato/publicação antes de aprovar
    if (tipo === 'projeto') {
      const [rows] = await pool.query("SELECT email_contato, empresa FROM projetos WHERE id = ?", [id]);
      if (rows.length > 0) {
        emailDestino = rows[0].email_contato;
        tituloItem = rows[0].empresa;
      }
    } else if (tipo === 'ideia') {
      const [rows] = await pool.query("SELECT titulo FROM ideias WHERE id = ?", [id]);
      if (rows.length > 0) {
        tituloItem = rows[0].titulo;
      }
    }

    if (tipo === 'projeto') {
      await pool.query("UPDATE projetos SET status = 'aprovado' WHERE id = ?", [id]);
    } else if (tipo === 'ideia') {
      await pool.query("UPDATE ideias SET status = 'aprovado' WHERE id = ?", [id]);
    }

    if (emailDestino) {
      enviarEmailAprovacao(emailDestino, tituloItem, tipo);
    }

    res.json({ message: "Aprovado com sucesso!" });
  } catch (err) { 
    console.error("Erro ao aprovar pendente:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

app.delete("/projetos/:id", autenticarToken, exigirAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM projetos WHERE id = ?", [req.params.id]);
    res.json({ message: "Projeto removido!" });
  } catch (err) { 
    console.error("Erro ao remover projeto:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

app.delete("/ideias/:id", autenticarToken, exigirAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM ideias WHERE id = ?", [req.params.id]);
    res.json({ message: "Ideia removida!" });
  } catch (err) { 
    console.error("Erro ao remover ideia:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

// --- LOGIN ---
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  const emailNormalizado = email.trim().toLowerCase();

  try {
    // Buscar usuário apenas pelo e-mail
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [emailNormalizado]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const usuario = rows[0];
    let senhaCorreta = false;
    const senhaSalva = usuario.senha;

    // Critério simples para identificar hash bcrypt ($2a$, $2b$, $2y$)
    const ehBcrypt = senhaSalva && (senhaSalva.startsWith("$2a$") || senhaSalva.startsWith("$2b$") || senhaSalva.startsWith("$2y$"));

    if (ehBcrypt) {
      senhaCorreta = await bcrypt.compare(senha, senhaSalva);
    } else {
      // COMPATIBILIDADE TEMPORÁRIA: Se a senha no banco não for hash, compara a string legada direta.
      // NOTA: Esta compatibilidade é provisória e deve ser removida após a migração de toda a base.
      senhaCorreta = (senha === senhaSalva);

      if (senhaCorreta) {
        // Se a senha plaintext legada estiver correta, gera imediatamente o hash seguro e atualiza o banco
        try {
          const saltRounds = 10;
          const novoHash = await bcrypt.hash(senha, saltRounds);
          await pool.query("UPDATE usuarios SET senha = ? WHERE id = ?", [novoHash, usuario.id]);
          console.log(`[Segurança] Usuário ID ${usuario.id} migrado silenciosamente para hash bcrypt.`);
        } catch (migrationErr) {
          console.error(`[Segurança] Erro ao migrar senha do usuário ID ${usuario.id}:`, migrationErr);
        }
      }
    }

    if (!senhaCorreta) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    // Gerar token JWT com dados mínimos (nunca incluir senha ou hash)
    const tokenPayload = {
      id: usuario.id,
      email: usuario.email,
      nivel: usuario.nivel
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Retornar token e dados básicos do usuário (sem senha)
    res.json({
      message: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel
      }
    });
  } catch (err) { 
    console.error("Erro ao realizar login:", err);
    res.status(500).json({ error: "Erro interno do servidor" }); 
  }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 API rodando na porta ${port}`));