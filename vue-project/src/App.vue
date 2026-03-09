<script setup>
import { ref, onMounted } from 'vue';
import Home from './components/Home.vue';
import PublicarProjeto from './components/Publicarprojeto.vue';
import Ideias from './components/Ideias.vue';
import Login from './components/Login.vue';
import Cadastro from './components/Cadastro.vue';

// --- ESTADOS GLOBAIS ---
const paginaAtual = ref('home');
const listaProjetos = ref([]);
const listaIdeias = ref([]);
const usuarioLogado = ref(null);

// --- BUSCA DE DADOS (API) ---
const carregarDados = async () => {
  try {
    const [resP, resI] = await Promise.all([
      fetch('https://conexo-api.onrender.com/projetos'),
      fetch('https://conexo-api.onrender.com/ideias')
    ]);
    
    if (resP.ok) listaProjetos.value = await resP.json();
    if (resI.ok) listaIdeias.value = await resI.json();
    
    console.log("✅ Dados sincronizados com o Render");
  } catch (err) { 
    console.error("❌ Erro ao conectar com a API:", err); 
  }
};

// --- AUTENTICAÇÃO ---
const confirmarLogin = (dados) => {
  usuarioLogado.value = dados;
  paginaAtual.value = 'home';
};

const deslogar = () => {
  usuarioLogado.value = null;
  paginaAtual.value = 'login';
};

// --- ADICIONAR ITENS ---
const adicionarProjeto = async (novo) => {
  try {
    const res = await fetch('https://conexo-api.onrender.com/projetos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    });
    if (res.ok) { 
      await carregarDados(); 
      paginaAtual.value = 'home'; 
    }
  } catch (err) {
    alert("Erro ao publicar projeto.");
  }
};

const adicionarIdeia = async (nova) => {
  try {
    const res = await fetch('https://conexo-api.onrender.com/ideias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nova)
    });
    if (res.ok) await carregarDados();
  } catch (err) {
    alert("Erro ao publicar ideia.");
  }
};

// --- EXCLUSÃO (ADMIN) ---
const deletarItem = async (tipo, id) => {
  if (!confirm(`Deseja realmente excluir este ${tipo}?`)) return;
  
  const rota = tipo === 'projeto' ? 'projetos' : 'ideias';
  
  try {
    const res = await fetch(`https://conexo-api.onrender.com/${rota}/${id}`, { 
      method: 'DELETE' 
    });

    if (res.ok) {
      alert("Excluído com sucesso!");
      
      // Atualiza a lista local para sumir da tela instantaneamente
      if (tipo === 'projeto') {
        listaProjetos.value = listaProjetos.value.filter(p => p.id !== id);
      } else {
        listaIdeias.value = listaIdeias.value.filter(i => i.id !== id);
      }
      
      // Sincroniza com o banco por segurança
      await carregarDados();
    } else {
      const erro = await res.json();
      alert(`Erro: ${erro.error || "Não foi possível excluir."}`);
    }
  } catch (err) {
    console.error("Erro na requisição:", err);
    alert("Erro de conexão com o servidor.");
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
            <span class="welcome-text">Olá, <strong>{{ usuarioLogado.nome }}</strong></span>
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
      
      <Login 
        v-if="paginaAtual === 'login'" 
        @logado="confirmarLogin" 
        @ir-para-cadastro="paginaAtual = 'cadastro'" 
      />

      <Cadastro 
        v-if="paginaAtual === 'cadastro'" 
        @ir-para-login="paginaAtual = 'login'" 
      />

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
/* --- ESTILOS GLOBAIS --- */
:root { 
  --primary: #10b981; 
  --dark: #051614; 
  --bg: #f8fafc;
}

body { 
  margin: 0; 
  font-family: 'Inter', sans-serif; 
  background: var(--bg); 
  color: #1e293b; 
}

/* NAVBAR */
.navbar { 
  background: var(--dark); 
  height: 70px; 
  display: flex; 
  align-items: center; 
  position: fixed; 
  width: 100%; 
  top: 0; 
  z-index: 1000; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.nav-content { 
  width: 100%; 
  max-width: 1400px; 
  margin: 0 auto; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 40px; 
}

.brand { 
  font-size: 1.6rem; 
  font-weight: 800; 
  color: var(--primary); 
  cursor: pointer; 
  letter-spacing: -1px;
}

.nav-center { display: flex; gap: 30px; }
.nav-center a { 
  color: #94a3b8; 
  cursor: pointer; 
  text-decoration: none; 
  font-weight: 500; 
  padding: 5px 0;
  transition: 0.2s;
}
.nav-center a:hover { color: white; }
.nav-center a.active { 
  color: var(--primary); 
  border-bottom: 2px solid var(--primary); 
}

.nav-right { display: flex; align-items: center; gap: 15px; }
.user-info { display: flex; align-items: center; gap: 12px; color: white; }

.avatar { 
  width: 32px; 
  height: 32px; 
  background: var(--primary); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 0.85rem; 
  font-weight: bold; 
  color: var(--dark);
}

.btn-sair { 
  background: rgba(239, 68, 68, 0.1); 
  border: 1px solid #ef4444; 
  color: #ef4444; 
  padding: 5px 12px; 
  border-radius: 6px; 
  cursor: pointer; 
  font-size: 0.8rem; 
  transition: 0.2s;
}
.btn-sair:hover { background: #ef4444; color: white; }

.btn-login-nav { 
  background: var(--primary); 
  color: white; 
  border: none; 
  padding: 8px 22px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: bold; 
  transition: 0.2s;
}
.btn-login-nav:hover { background: #059669; transform: translateY(-1px); }

.main-content { padding-top: 70px; min-height: 100vh; }

@media (max-width: 768px) {
  .nav-content { padding: 0 20px; }
  .welcome-text { display: none; }
  .nav-center { gap: 15px; font-size: 0.9rem; }
}
</style>