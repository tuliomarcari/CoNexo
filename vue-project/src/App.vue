<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_URL } from './config';
import Home from './components/Home.vue';
import PublicarProjeto from './components/Publicarprojeto.vue';
import Ideias from './components/Ideias.vue';
import Login from './components/Login.vue';
import Cadastro from './components/Cadastro.vue';
import AdminPainel from './components/AdminPainel.vue';

const paginaAtual = ref('home');
const listaProjetos = ref([]);
const listaIdeias = ref([]);
const usuarioLogado = ref(null);
const menuMobileAberto = ref(false);

const carregarDados = async () => {
  try {
    const [resP, resI] = await Promise.all([
      axios.get(`${API_URL}/projetos`),
      axios.get(`${API_URL}/ideias`)
    ]);
    listaProjetos.value = resP.data;
    listaIdeias.value = resI.data;
  } catch (err) { console.error("Erro ao carregar:", err); }
};

const confirmarLogin = (dados) => {
  usuarioLogado.value = dados;
  localStorage.setItem('usuario', JSON.stringify(dados));
  paginaAtual.value = 'home';
  menuMobileAberto.value = false;
};

const deslogar = () => {
  usuarioLogado.value = null;
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  paginaAtual.value = 'login';
  menuMobileAberto.value = false;
};

const navegar = (pagina) => {
  paginaAtual.value = pagina;
  menuMobileAberto.value = false;
};

const adicionarProjeto = async (projeto) => {
  try {
    const projetoComStatus = { ...projeto, status: 'pendente' };
    const res = await axios.post(`${API_URL}/projetos`, projetoComStatus);
    if (res.status === 200 || res.status === 201) {
      alert("Projeto enviado com sucesso! Ele aparecerá no painel para aprovação.");
      paginaAtual.value = 'home';
      await carregarDados();
    }
  } catch (err) {
    console.error("Erro detalhado:", err.response?.data || err.message);
    alert("Erro ao publicar projeto. Verifique a conexão.");
  }
};

const adicionarIdeia = async (nova) => {
  try {
    await axios.post(`${API_URL}/ideias`, nova);
    await carregarDados();
  } catch (err) { alert("Erro ao publicar ideia."); }
};

const deletarItem = async (tipo, id) => {
  if (!confirm(`Deseja excluir este ${tipo}?`)) return;
  const rota = tipo === 'projeto' ? 'projetos' : 'ideias';
  
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    await axios.delete(`${API_URL}/${rota}/${id}`, { headers });
    await carregarDados();
  } catch (err) { 
    console.error(err);
    alert("Erro ao excluir. Verifique se sua sessão não expirou."); 
  }
};

onMounted(() => {
  const usuarioSalvo = localStorage.getItem('usuario');
  if (usuarioSalvo) {
    try {
      usuarioLogado.value = JSON.parse(usuarioSalvo);
    } catch {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
    }
  }
  carregarDados();
});
</script>

<template>
  <div class="app-root">

    <header class="cx-navbar" :class="{ 'cx-navbar--scrolled': paginaAtual !== 'home' }">
      <div class="cx-navbar__inner">

        <!-- Logo / Brand -->
        <button class="cx-brand" @click="navegar('home')" aria-label="Ir para home">
          <svg class="cx-brand__logo" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.5L21 7.5V16.5L12 21.5L3 16.5V7.5L12 2.5Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
          </svg>
          <span class="cx-brand__mark">Co</span><span class="cx-brand__name">Nexo</span>
        </button>

        <!-- Nav principal — desktop -->
        <nav class="cx-nav" aria-label="Navegação principal">
          <button
            class="cx-nav__link"
            :class="{ 'cx-nav__link--active': paginaAtual === 'home' }"
            @click="navegar('home')"
          >Início</button>

          <button
            class="cx-nav__link"
            :class="{ 'cx-nav__link--active': paginaAtual === 'publicar' }"
            @click="navegar('publicar')"
          >Projetos</button>

          <button
            class="cx-nav__link"
            :class="{ 'cx-nav__link--active': paginaAtual === 'ideias' }"
            @click="navegar('ideias')"
          >Ideias</button>

          <button
            v-if="usuarioLogado?.nivel === 'admin'"
            class="cx-nav__link cx-nav__link--admin"
            :class="{ 'cx-nav__link--active': paginaAtual === 'admin' }"
            @click="navegar('admin')"
          >Admin</button>
        </nav>

        <!-- Ações do usuário -->
        <div class="cx-nav-actions">
          <template v-if="usuarioLogado">
            <div class="cx-user">
              <div class="cx-user__avatar" :title="usuarioLogado.nome">
                {{ usuarioLogado.nome.charAt(0).toUpperCase() }}
              </div>
              <span class="cx-user__name">{{ usuarioLogado.nome.split(' ')[0] }}</span>
            </div>
            <button class="cx-btn-ghost" @click="deslogar">Sair</button>
          </template>
          <template v-else>
            <button class="cx-btn-ghost" @click="navegar('login')">Entrar</button>
            <button class="cx-btn-primary" @click="navegar('cadastro')">Criar conta</button>
          </template>
        </div>

        <!-- Toggle mobile -->
        <button
          class="cx-nav-toggle"
          @click="menuMobileAberto = !menuMobileAberto"
          :aria-expanded="menuMobileAberto"
          aria-label="Menu"
        >
          <span></span><span></span><span></span>
        </button>

      </div>

      <!-- Menu mobile -->
      <div class="cx-nav-mobile" :class="{ 'cx-nav-mobile--open': menuMobileAberto }">
        <button class="cx-nav-mobile__link" @click="navegar('home')">Início</button>
        <button class="cx-nav-mobile__link" @click="navegar('publicar')">Projetos</button>
        <button class="cx-nav-mobile__link" @click="navegar('ideias')">Ideias</button>
        <button v-if="usuarioLogado?.nivel === 'admin'" class="cx-nav-mobile__link" @click="navegar('admin')">Admin</button>
        <div class="cx-nav-mobile__divider"></div>
        <template v-if="usuarioLogado">
          <button class="cx-nav-mobile__link cx-nav-mobile__link--danger" @click="deslogar">Sair da conta</button>
        </template>
        <template v-else>
          <button class="cx-nav-mobile__link" @click="navegar('login')">Entrar</button>
          <button class="cx-nav-mobile__link cx-nav-mobile__link--primary" @click="navegar('cadastro')">Criar conta</button>
        </template>
      </div>
    </header>

    <main class="cx-main">
      <Home
        v-if="paginaAtual === 'home'"
        :projetos="listaProjetos"
        @navegar="navegar"
      />
      <Login
        v-if="paginaAtual === 'login'"
        @logado="confirmarLogin"
        @ir-para-cadastro="navegar('cadastro')"
      />
      <Cadastro
        v-if="paginaAtual === 'cadastro'"
        @ir-para-login="navegar('login')"
      />
      <PublicarProjeto
        v-if="paginaAtual === 'publicar'"
        :projetos="listaProjetos"
        :user="usuarioLogado"
        @salvar="adicionarProjeto"
        @excluir="id => deletarItem('projeto', id)"
      />
      <Ideias
        v-if="paginaAtual === 'ideias'"
        :ideias="listaIdeias"
        :user="usuarioLogado"
        @nova-ideia="adicionarIdeia"
        @excluir="id => deletarItem('ideia', id)"
      />
      <AdminPainel v-if="paginaAtual === 'admin'" @dados-atualizados="carregarDados" />
    </main>

  </div>
</template>

<style>
/* ─── App Root ──────────────────────────────────────────────────────────────── */
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cx-main {
  flex: 1;
  padding-top: var(--cx-navbar-h);
}

/* ─── Navbar ────────────────────────────────────────────────────────────────── */
.cx-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--cx-navbar-h);
  background: rgba(12, 17, 23, 0.97);
  border-bottom: 1px solid var(--cx-dark-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.cx-navbar__inner {
  max-width: var(--cx-container);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--cx-space-8);
  display: flex;
  align-items: center;
  gap: var(--cx-space-8);
}

/* Brand */
.cx-brand {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 0;
  flex-shrink: 0;
  letter-spacing: -0.02em;
  align-items: center;
}

.cx-brand__logo {
  width: 26px;
  height: 26px;
  color: var(--cx-primary);
  margin-right: 4px;
  filter: drop-shadow(0 0 8px var(--cx-primary)) drop-shadow(0 0 4px var(--cx-primary));
  transition: filter var(--cx-transition-fast), transform var(--cx-transition-fast);
}

.cx-brand:hover .cx-brand__logo {
  filter: drop-shadow(0 0 12px var(--cx-primary)) drop-shadow(0 0 6px var(--cx-primary));
  transform: scale(1.05);
}

.cx-brand__mark {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--cx-primary);
  font-family: var(--cx-font-sans);
}

.cx-brand__name {
  font-size: 1.35rem;
  font-weight: 300;
  color: #ffffff;
  font-family: var(--cx-font-sans);
}

/* Nav links */
.cx-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--cx-space-1);
  flex: 1;
}

.cx-nav__link {
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--cx-font-sans);
  font-size: var(--cx-text-sm);
  font-weight: 500;
  color: var(--cx-text-faint);
  padding: var(--cx-space-2) var(--cx-space-4);
  border-radius: var(--cx-radius-md);
  transition: color var(--cx-transition-fast), background var(--cx-transition-fast);
  letter-spacing: 0.01em;
}

.cx-nav__link:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.06);
}

.cx-nav__link--active {
  color: #ffffff;
}

.cx-nav__link--admin {
  color: var(--cx-primary);
  border: 1px solid rgba(13, 156, 110, 0.3);
}

.cx-nav__link--admin:hover {
  background: var(--cx-primary-alpha);
  color: var(--cx-primary);
}

/* Nav Actions */
.cx-nav-actions {
  display: flex;
  align-items: center;
  gap: var(--cx-space-3);
  margin-left: auto;
}

.cx-user {
  display: flex;
  align-items: center;
  gap: var(--cx-space-2);
}

.cx-user__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--cx-primary);
  color: #fff;
  font-size: var(--cx-text-sm);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cx-user__name {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-faint);
  font-weight: 500;
}

/* Botões da navbar */
.cx-btn-ghost {
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
  padding: 6px 16px;
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-weight: 500;
  cursor: pointer;
  font-family: var(--cx-font-sans);
  transition: border-color var(--cx-transition-fast), color var(--cx-transition-fast);
}

.cx-btn-ghost:hover {
  border-color: rgba(255,255,255,0.35);
  color: #ffffff;
}

.cx-btn-primary {
  background: var(--cx-primary);
  border: none;
  color: #fff;
  padding: 7px 18px;
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--cx-font-sans);
  transition: background var(--cx-transition-fast), box-shadow var(--cx-transition-fast);
  letter-spacing: 0.01em;
}

.cx-btn-primary:hover {
  background: var(--cx-primary-dark);
  box-shadow: var(--cx-shadow-primary);
}

/* Mobile toggle */
.cx-nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--cx-space-2);
  margin-left: auto;
}

.cx-nav-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: rgba(255,255,255,0.7);
  border-radius: 2px;
  transition: background var(--cx-transition-fast);
}

.cx-nav-toggle:hover span {
  background: #ffffff;
}

/* Mobile menu */
.cx-nav-mobile {
  display: none;
  flex-direction: column;
  background: var(--cx-dark-2);
  border-top: 1px solid var(--cx-dark-border);
  padding: var(--cx-space-4) var(--cx-space-6);
  gap: var(--cx-space-1);
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--cx-transition-slow), padding var(--cx-transition-base);
}

.cx-nav-mobile--open {
  max-height: 400px;
  padding: var(--cx-space-4) var(--cx-space-6);
}

.cx-nav-mobile__link {
  background: none;
  border: none;
  color: var(--cx-text-faint);
  font-family: var(--cx-font-sans);
  font-size: var(--cx-text-base);
  font-weight: 500;
  text-align: left;
  padding: var(--cx-space-3) var(--cx-space-2);
  cursor: pointer;
  border-radius: var(--cx-radius-md);
  transition: color var(--cx-transition-fast), background var(--cx-transition-fast);
}

.cx-nav-mobile__link:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.05);
}

.cx-nav-mobile__link--primary {
  color: var(--cx-primary);
  font-weight: 600;
}

.cx-nav-mobile__link--danger {
  color: #f87171;
}

.cx-nav-mobile__divider {
  height: 1px;
  background: var(--cx-dark-border);
  margin: var(--cx-space-2) 0;
}

/* ─── Responsivo ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .cx-navbar {
    height: auto;
    position: fixed;
  }

  .cx-navbar__inner {
    height: var(--cx-navbar-h);
    padding: 0 var(--cx-space-6);
    flex-wrap: wrap;
  }

  .cx-nav,
  .cx-nav-actions {
    display: none;
  }

  .cx-nav-toggle {
    display: flex;
  }

  .cx-nav-mobile {
    display: flex;
  }

  .cx-main {
    padding-top: var(--cx-navbar-h);
  }
}
</style>