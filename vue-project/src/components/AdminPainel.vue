<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-brand">CoNexo <span>ADMIN</span></div>
      <nav class="admin-nav">
        <button @click="abaAtiva = 'negociacoes'" :class="{ active: abaAtiva === 'negociacoes' }" class="nav-item">📂 Negociações</button>
        <button @click="abaAtiva = 'pendentes'" :class="{ active: abaAtiva === 'pendentes' }" class="nav-item badge-parent">
          ⏳ Pendentes
          <span v-if="pendentes.length > 0" class="badge-count">{{ pendentes.length }}</span>
        </button>
      </nav>
    </aside>

    <main class="admin-main">
      <section v-if="abaAtiva === 'pendentes'" class="admin-section">
        <h2 class="section-title">Aguardando Aprovação</h2>
        <div v-if="pendentes.length === 0" class="empty-state">Nenhum item pendente no momento.</div>

        <div class="grid-pendentes">
          <div v-for="item in pendentes" :key="item.id" class="pendente-card">
            <div class="card-header">
              <span class="tag-nicho">{{ item.nicho }}</span>
              <span class="tag-data">📍 {{ item.cidade }}/{{ item.estado }}</span>
            </div>
            <h3 class="card-empresa">{{ item.empresa || item.titulo }}</h3>
            <p class="card-desc">{{ item.descricao }}</p>
            <div v-if="item.valor" class="card-financeiro">
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
        <p class="empty-text">Selecione uma negociação à esquerda para ver o histórico.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const abaAtiva = ref('pendentes');
const pendentes = ref([]);

const carregarPendentes = async () => {
  try {
    const res = await axios.get('https://conexo-api.onrender.com/admin/pendentes');
    pendentes.value = res.data;
  } catch (err) { console.error(err); }
};

const aprovar = async (id) => {
  if (!confirm("Aprovar este item?")) return;
  try {
    await axios.put(`https://conexo-api.onrender.com/admin/aprovar/${id}`);
    alert("Aprovado!");
    await carregarPendentes();
  } catch (err) { alert("Erro ao aprovar."); }
};

const rejeitar = async (id) => {
  if (!confirm("Rejeitar este item?")) return;
  try {
    await axios.delete(`https://conexo-api.onrender.com/projetos/${id}`);
    await carregarPendentes();
  } catch (err) { alert("Erro ao excluir."); }
};

onMounted(carregarPendentes);
</script>

<style scoped>
/* SEUS ESTILOS DARK (Mantidos 100%) */
.admin-layout { display: flex; min-height: 100vh; background: #0b0f1a; color: white; }
.admin-sidebar { width: 260px; background: #161b22; border-right: 1px solid #30363d; padding: 20px; }
.admin-brand { font-size: 1.4rem; font-weight: 800; color: #10b981; margin-bottom: 40px; }
.admin-brand span { font-size: 0.7rem; color: #8b949e; margin-left: 5px; border: 1px solid #30363d; padding: 2px 5px; border-radius: 4px; }
.admin-nav { display: flex; flex-direction: column; gap: 10px; }
.nav-item { background: transparent; border: none; color: #8b949e; text-align: left; padding: 12px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
.nav-item:hover { background: #21262d; color: white; }
.nav-item.active { background: #10b981; color: #0b0f1a; }
.badge-parent { display: flex; justify-content: space-between; align-items: center; }
.badge-count { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; }
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