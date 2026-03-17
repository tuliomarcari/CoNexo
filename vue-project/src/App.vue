<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // 1. Importação essencial
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

const carregarDados = async () => {
  try {
    // 2. Padronizado para Axios para evitar erro de conexão
    const [resP, resI] = await Promise.all([
      axios.get('https://conexo-api.onrender.com/projetos'),
      axios.get('https://conexo-api.onrender.com/ideias')
    ]);
    listaProjetos.value = resP.data;
    listaIdeias.value = resI.data;
  } catch (err) { console.error("Erro API:", err); }
};

const confirmarLogin = (dados) => {
  usuarioLogado.value = dados;
  localStorage.setItem('usuario', JSON.stringify(dados));
  paginaAtual.value = 'home';
};

const deslogar = () => {
  usuarioLogado.value = null;
  localStorage.removeItem('usuario');
  paginaAtual.value = 'login';
};

// 3. FUNÇÃO CORRIGIDA: Agora envia o projeto corretamente para o banco
const adicionarProjeto = async (projetoComStatus) => {
  try {
    const res = await axios.post('https://conexo-api.onrender.com/projetos', projetoComStatus);
    if (res.status === 200 || res.status === 201) { 
      alert("Enviado com sucesso! Aguarde a aprovação do administrador.");
      paginaAtual.value = 'home'; 
    }
  } catch (err) {
    alert("Erro ao publicar projeto.");
  }
};

const adicionarIdeia = async (nova) => {
  try {
    await axios.post('https://conexo-api.onrender.com/ideias', nova);
    await carregarDados();
  } catch (err) { alert("Erro ao publicar ideia."); }
};

const deletarItem = async (tipo, id) => {
  if (!confirm(`Deseja realmente excluir?`)) return;
  const rota = tipo === 'projeto' ? 'projetos' : 'ideias';
  try {
    await axios.delete(`https://conexo-api.onrender.com/${rota}/${id}`);
    await carregarDados();
  } catch (err) { alert("Erro ao excluir."); }
};

onMounted(carregarDados);
</script>

<template>
  <div class="app-container">
    <header class="navbar">
      <div class="nav-content">
        <div class="brand" @click="paginaAtual = 'home'">CoNexo</div>
        <nav class="nav-center">
          <a @click="paginaAtual = 'home'" :class="{ active: paginaAtual === 'home' }">Home</a>
          <a @click="paginaAtual = 'publicar'" :class="{ active: paginaAtual === 'publicar' }">Projetos</a>
          <a @click="paginaAtual = 'ideias'" :class="{ active: paginaAtual === 'ideias' }">Ideias</a>
          <a v-if="usuarioLogado?.nivel === 'admin'" @click="paginaAtual = 'admin'" :class="{ active: paginaAtual === 'admin' }" class="nav-admin">🛠️ Painel Admin</a>
        </nav>
        <div class="nav-right">
          <div v-if="usuarioLogado" class="user-info">
            <span class="avatar">{{ usuarioLogado.nome.charAt(0) }}</span>
            <button @click="deslogar" class="btn-sair">Sair</button>
          </div>
          <button v-else @click="paginaAtual = 'login'" class="btn-login-nav">Entrar</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <Home v-if="paginaAtual === 'home'" :projetos="listaProjetos" @navegar="d => paginaAtual = d" />
      <Login v-if="paginaAtual === 'login'" @logado="confirmarLogin" @ir-para-cadastro="paginaAtual = 'cadastro'" />
      <Cadastro v-if="paginaAtual === 'cadastro'" @ir-para-login="paginaAtual = 'login'" />
      <PublicarProjeto v-if="paginaAtual === 'publicar'" :projetos="listaProjetos" :user="usuarioLogado" @salvar="adicionarProjeto" @excluir="id => deletarItem('projeto', id)" />
      <Ideias v-if="paginaAtual === 'ideias'" :ideias="listaIdeias" :user="usuarioLogado" @nova-ideia="adicionarIdeia" @excluir="id => deletarItem('ideia', id)" />
      <AdminPainel v-if="paginaAtual === 'admin'" />
    </main>
  </div>
</template>

<style>
/* SEUS ESTILOS ORIGINAIS (Mantidos 100%) */
:root { --primary: #10b981; --dark: #051614; --bg: #f8fafc; }
body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: #1e293b; }
.navbar { background: var(--dark); height: 70px; display: flex; align-items: center; position: fixed; width: 100%; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.nav-content { width: 100%; max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; }
.brand { font-size: 1.6rem; font-weight: 800; color: var(--primary); cursor: pointer; letter-spacing: -1px; }
.nav-center { display: flex; gap: 30px; }
.nav-center a { color: #94a3b8; cursor: pointer; text-decoration: none; font-weight: 500; padding: 5px 0; transition: 0.2s; }
.nav-center a:hover { color: white; }
.nav-center a.active { color: var(--primary); border-bottom: 2px solid var(--primary); }
.nav-admin { background: rgba(16, 185, 129, 0.1); padding: 5px 12px !important; border-radius: 6px; color: var(--primary) !important; }
.nav-right { display: flex; align-items: center; gap: 15px; }
.user-info { display: flex; align-items: center; gap: 12px; color: white; }
.avatar { width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; color: var(--dark); }
.btn-sair { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
.btn-login-nav { background: var(--primary); color: white; border: none; padding: 8px 22px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.main-content { padding-top: 70px; min-height: 100vh; }
</style>