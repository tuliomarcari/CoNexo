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
              <span class="tag-tipo">📍 {{ item.cidade }}</span>
            </div>
            <h3 class="card-empresa">{{ item.empresa || item.titulo }}</h3>
            <p class="card-desc">{{ item.descricao }}</p>
            <div class="card-actions">
              <button @click="aprovar(item.id)" class="btn-aprovar">✅ Aprovar</button>
              <button @click="rejeitar(item.id)" class="btn-rejeitar">❌ Rejeitar</button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="abaAtiva === 'negociacoes'" class="admin-section">
        <h2 class="section-title">Negociações</h2>
        <p>Área em desenvolvimento.</p>
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
  } catch (err) { console.error("Erro ao buscar pendentes:", err); }
};

const aprovar = async (id) => {
  if (!confirm("Confirmar aprovação?")) return;
  try {
    await axios.put(`https://conexo-api.onrender.com/admin/aprovar/${id}`);
    alert("Aprovado!");
    await carregarPendentes();
  } catch (err) { alert("Erro ao aprovar."); }
};

const rejeitar = async (id) => {
  if (!confirm("Remover item?")) return;
  try {
    await axios.delete(`https://conexo-api.onrender.com/projetos/${id}`);
    await carregarPendentes();
  } catch (err) { alert("Erro ao rejeitar."); }
};

onMounted(carregarPendentes);
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; background: #0b0f1a; color: white; }
.admin-sidebar { width: 260px; background: #161b22; border-right: 1px solid #30363d; padding: 20px; }
.admin-brand { font-size: 1.4rem; font-weight: 800; color: #10b981; margin-bottom: 40px; }
.admin-brand span { font-size: 0.7rem; color: #8b949e; border: 1px solid #30363d; padding: 2px 5px; border-radius: 4px; }
.admin-nav { display: flex; flex-direction: column; gap: 10px; }
.nav-item { background: transparent; border: none; color: #8b949e; text-align: left; padding: 12px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.nav-item.active { background: #10b981; color: #0b0f1a; }
.badge-count { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; }
.admin-main { flex: 1; padding: 40px; }
.grid-pendentes { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.pendente-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; }
.tag-nicho { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; }
.btn-aprovar { background: #10b981; color: #0b0f1a; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 15px; }
.btn-rejeitar { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 5px; }
</style>