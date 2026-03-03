<script setup>
import { ref, onMounted } from 'vue';
import Home from './components/Home.vue';
import PublicarProjeto from './components/Publicarprojeto.vue';
import Ideias from './components/Ideias.vue';
import Login from './components/Login.vue'; // Importamos o Login

const paginaAtual = ref('home');
const listaProjetos = ref([]);
const listaIdeias = ref([]);

// Estado do Usuário: começa nulo (deslogado)
const usuarioLogado = ref(null);

const carregarDados = async () => {
  try {
    const [resP, resI] = await Promise.all([
      fetch('https://conexo-api.onrender.com/projetos'),
      fetch('https://conexo-api.onrender.com/ideias')
    ]);
    if (resP.ok) listaProjetos.value = await resP.json();
    if (resI.ok) listaIdeias.value = await resI.json();
  } catch (err) { console.error("Erro ao carregar dados:", err); }
};

// Gerenciamento de Login
const confirmarLogin = (dados) => {
  usuarioLogado.value = dados;
  paginaAtual.value = 'home';
};

const deslogar = () => {
  usuarioLogado.value = null;
  paginaAtual.value = 'login';
};

// Funções de Adição
const adicionarProjeto = async (novo) => {
  const res = await fetch('https://conexo-api.onrender.com/projetos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novo)
  });
  if (res.ok) { await carregarDados(); paginaAtual.value = 'home'; }
};

const adicionarIdeia = async (nova) => {
  const res = await fetch('https://conexo-api.onrender.com/ideias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nova)
  });
  if (res.ok) await carregarDados();
};

// Função de Exclusão (Admin)
const deletarItem = async (tipo, id) => {
  if (!confirm("Deseja realmente excluir este item?")) return;
  
  const rota = tipo === 'projeto' ? 'projetos' : 'ideias';
  try {
    const res = await fetch(`https://conexo-api.onrender.com/${rota}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert("Excluído com sucesso!");
      await carregarDados();
    }
  } catch (err) {
    alert("Erro ao excluir item.");
  }
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
          <a @click="paginaAtual = 'publicar'" :class="{ active: paginaAtual === 'publicar' || paginaAtual === 'projetos' }">Projetos</a>
          <a @click="paginaAtual = 'ideias'" :class="{ active: paginaAtual === 'ideias' }">Ideias</a>
        </nav>
        
        <div class="nav-right">
          <div v-if="usuarioLogado" class="user-info">
            <span class="avatar">{{ usuarioLogado.nome.charAt(0) }}</span>
            <span>Olá, <strong>{{ usuarioLogado.nome }}</strong></span>
            <button @click="deslogar" class="btn-sair">Sair</button>
          </div>
          <button v-else @click="paginaAtual = 'login'" class="btn-login-nav">Entrar</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <Home 
        v-if="paginaAtual === 'home'" 
        :projetos="listaProjetos" 
        @navegar="destino => paginaAtual = destino"
      />
      
      <Login v-if="paginaAtual === 'login'" @logado="confirmarLogin" />

      <PublicarProjeto 
        v-if="paginaAtual === 'publicar' || paginaAtual === 'projetos'" 
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
    </main>
  </div>
</template>

<style>
:root { --primary: #10b981; --dark: #051614; }
body { margin: 0; font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; }
.navbar { background: var(--dark); height: 70px; display: flex; align-items: center; position: fixed; width: 100%; top: 0; z-index: 1000; }
.nav-content { width: 100%; max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; }
.brand { font-size: 1.5rem; font-weight: bold; color: var(--primary); cursor: pointer; }
.nav-center { display: flex; gap: 30px; }
.nav-center a { color: #94a3b8; cursor: pointer; text-decoration: none; font-weight: 500; }
.nav-center a.active { color: var(--primary); border-bottom: 2px solid var(--primary); }
.nav-right { display: flex; align-items: center; gap: 15px; color: white; }
.user-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; }
.btn-sair { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; margin-left: 10px; }
.btn-login-nav { background: var(--primary); color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.main-content { padding-top: 70px; width: 100%; }
</style>