<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        CoNexo <span>ADMIN</span>
      </div>
      
      <nav class="admin-nav">
        <button 
          @click="abaAtiva = 'negociacoes'" 
          :class="{ active: abaAtiva === 'negociacoes' }"
          class="nav-item"
        >
          📂 Negociações
        </button>
        <button 
          @click="abaAtiva = 'pendentes'" 
          :class="{ active: abaAtiva === 'pendentes' }"
          class="nav-item badge-parent"
        >
          ⏳ Pendentes
          <span v-if="pendentes.length > 0" class="badge-count">{{ pendentes.length }}</span>
        </button>
      </nav>
    </aside>

    <main class="admin-main">
      <section v-if="abaAtiva === 'pendentes'" class="admin-section">
        <h2 class="section-title">Aguardando Aprovação</h2>
        
        <div v-if="pendentes.length === 0" class="empty-state">
          Nenhum item pendente no momento.
        </div>

        <div class="grid-pendentes">
          <div v-for="item in pendentes" :key="item.id" class="pendente-card">
            <div class="card-header">
              <span class="tag-nicho">{{ item.nicho }}</span>
              <span class="tag-data">📍 {{ item.cidade }}/{{ item.estado }}</span>
            </div>
            
            <h3 class="card-empresa">{{ item.empresa }}</h3>
            <p class="card-desc">{{ item.descricao }}</p>
            
            <div class="card-financeiro">
              <span><strong>Valor:</strong> R$ {{ Number(item.valor).toLocaleString() }}</span>
              <span><strong>Equity:</strong> {{ item.porcentagem }}%</span>
            </div>

            <div class="card-actions">
              <button @click="aprovar(item.id)" class="btn-aprovar">✅ Aprovar</button>
              <button @click="rejeitar(item.id)" class="btn-rejeitar">❌ Rejeitar</button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="abaAtiva === 'negociacoes'" class="admin-section">
        <h2 class="section-title">Histórico de Negociações</h2>
        <p class="empty-text">Selecione uma negociação à esquerda para ver o histórico ou gerencie os itens pendentes.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // Importação essencial que estava faltando no build

const API = 'https://conexo-api.onrender.com';
const abaAtiva = ref('pendentes');
const pendentes = ref([]);

// Busca projetos com status 'pendente'
const carregarPendentes = async () => {
  try {
    const res = await axios.get(`${API}/admin/pendentes`);
    pendentes.value = res.data;
  } catch (err) {
    console.error("Erro ao buscar pendentes:", err);
  }
};

const aprovar = async (id) => {
  if (!confirm("Confirmar aprovação deste projeto?")) return;
  try {
    // Rota que muda o status de 'pendente' para 'aprovado'
    await axios.put(`${API}/admin/aprovar/${id}`);
    alert("Projeto aprovado e publicado na Home!");
    await carregarPendentes();
  } catch (err) {
    alert("Erro ao aprovar projeto.");
  }
};

const rejeitar = async (id) => {
  if (!confirm("Deseja realmente rejeitar/excluir este projeto?")) return;
  try {
    await axios.delete(`${API}/projetos/${id}`);
    alert("Projeto removido.");
    await carregarPendentes();
  } catch (err) {
    alert("Erro ao rejeitar.");
  }
};

onMounted(() => {
  carregarPendentes();
});
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; background: #0b0f1a; color: white; }

/* Sidebar */
.admin-sidebar { width: 260px; background: #161b22; border-right: 1px solid #30363d; padding: 20px; }
.admin-brand { font-size: 1.4rem; font-weight: 800; color: #10b981; margin-bottom: 40px; }
.admin-brand span { font-size: 0.7rem; color: #8b949e; margin-left: 5px; border: 1px solid #30363d; padding: 2px 5px; border-radius: 4px; }

.admin-nav { display: flex; flex-direction: column; gap: 10px; }
.nav-item { 
  background: transparent; border: none; color: #8b949e; text-align: left; 
  padding: 12px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;
}
.nav-item:hover { background: #21262d; color: white; }
.nav-item.active { background: #10b981; color: #0b0f1a; }

.badge-parent { display: flex; justify-content: space-between; align-items: center; }
.badge-count { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; }

/* Conteúdo Principal */
.admin-main { flex: 1; padding: 40px; }
.section-title { font-size: 1.8rem; margin-bottom: 30px; }

.grid-pendentes { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.pendente-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; }

.card-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
.tag-nicho { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.tag-data { color: #8b949e; font-size: 0.8rem; }

.card-empresa { font-size: 1.2rem; margin-bottom: 10px; }
.card-desc { color: #8b949e; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; }

.card-financeiro { display: flex; flex-direction: column; gap: 5px; margin-bottom: 20px; font-size: 0.9rem; padding: 10px; background: #0d1117; border-radius: 8px; }

.card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-aprovar { background: #10b981; color: #0b0f1a; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-rejeitar { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; }

.empty-state { color: #8b949e; font-style: italic; }
</style>