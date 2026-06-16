<template>
  <div class="admin-shell">

    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="admin-sidebar__head">
        <span class="admin-sidebar__brand"><strong>Co</strong>Nexo</span>
        <span class="admin-sidebar__tag">Admin</span>
      </div>

      <nav class="admin-nav" aria-label="Menu administrativo">
        <button
          class="admin-nav__item"
          :class="{ 'admin-nav__item--active': abaAtiva === 'projetos' }"
          @click="abaAtiva = 'projetos'"
        >
          <svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          Projetos Pendentes
          <span v-if="projetosPendentes.length > 0" class="admin-nav__badge">{{ projetosPendentes.length }}</span>
        </button>

        <button
          class="admin-nav__item"
          :class="{ 'admin-nav__item--active': abaAtiva === 'ideias' }"
          @click="abaAtiva = 'ideias'"
        >
          <svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Ideias Pendentes
          <span v-if="ideiasPendentes.length > 0" class="admin-nav__badge">{{ ideiasPendentes.length }}</span>
        </button>

        <button
          class="admin-nav__item"
          :class="{ 'admin-nav__item--active': abaAtiva === 'negociacoes' }"
          @click="abaAtiva = 'negociacoes'"
        >
          <svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Negociações
        </button>
      </nav>
    </aside>

    <!-- Conteúdo principal -->
    <main class="admin-main" role="main">

      <!-- Pendentes (Projetos e Ideias) -->
      <section v-if="abaAtiva === 'projetos' || abaAtiva === 'ideias'" class="admin-section">
        <div class="admin-section__head">
          <div>
            <h1 class="admin-section__title">
              {{ abaAtiva === 'projetos' ? 'Projetos pendentes' : 'Ideias pendentes' }}
            </h1>
            <p class="admin-section__sub">
              {{ abaAtiva === 'projetos' 
                 ? 'Revise e aprove os projetos submetidos pela comunidade.' 
                 : 'Revise e aprove as ideias submetidas pela comunidade.' }}
            </p>
          </div>
          <button class="admin-refresh" @click="carregarPendentes" title="Atualizar lista" aria-label="Atualizar lista de pendentes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Atualizar
          </button>
        </div>

        <!-- Erro de acesso -->
        <div v-if="erroAcesso" class="admin-alert admin-alert--error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ erroAcesso }}
        </div>

        <!-- Empty state -->
        <div v-else-if="!erroAcesso && listaAtual.length === 0" class="admin-empty" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" aria-hidden="true">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p>Nenhum(a) {{ abaAtiva === 'projetos' ? 'projeto' : 'ideia' }} aguardando aprovação.</p>
        </div>

        <!-- Grid de pendentes -->
        <div class="admin-grid" v-else>
          <article class="admin-card" v-for="item in listaAtual" :key="item.id">
            <header class="admin-card__head">
              <div class="admin-card__meta">
                <span class="admin-card__tipo" :class="item.tipo_item === 'projeto' ? 'admin-card__tipo--projeto' : 'admin-card__tipo--ideia'">
                  {{ item.tipo_item === 'projeto' ? 'Projeto' : 'Ideia' }}
                </span>
                <span class="admin-card__nicho">{{ item.nicho }}</span>
              </div>
              <span v-if="item.cidade" class="admin-card__loc">{{ item.cidade }}, {{ item.estado }}</span>
            </header>

            <h2 class="admin-card__title">{{ item.empresa || item.titulo }}</h2>
            <p class="admin-card__desc">{{ item.descricao }}</p>

            <div v-if="item.valor" class="admin-card__financial">
              <div class="admin-card__financial-item">
                <span>Captação</span>
                <strong>R$ {{ Number(item.valor).toLocaleString('pt-BR') }}</strong>
              </div>
              <div class="admin-card__financial-item">
                <span>Equity</span>
                <strong>{{ item.porcentagem }}%</strong>
              </div>
            </div>

            <footer class="admin-card__foot">
              <button class="admin-btn admin-btn--approve" @click="aprovar(item)">
                Aprovar
              </button>
              <button class="admin-btn admin-btn--reject" @click="rejeitar(item)">
                Rejeitar
              </button>
            </footer>
          </article>
        </div>
      </section>

      <!-- Negociações -->
      <section v-if="abaAtiva === 'negociacoes'" class="admin-section">
        <div class="admin-section__head">
          <div>
            <h1 class="admin-section__title">Negociações</h1>
            <p class="admin-section__sub">Histórico e acompanhamento de negociações em andamento.</p>
          </div>
        </div>
        <div class="admin-empty" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>Esta área está em desenvolvimento.</p>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { API_URL } from '../config';

const abaAtiva = ref('projetos');
const pendentes = ref([]);
const erroAcesso = ref('');

const projetosPendentes = computed(() => pendentes.value.filter(p => p.tipo_item === 'projeto'));
const ideiasPendentes = computed(() => pendentes.value.filter(p => p.tipo_item === 'ideia'));

const listaAtual = computed(() => {
  return abaAtiva.value === 'projetos' ? projetosPendentes.value : ideiasPendentes.value;
});

const emit = defineEmits(['dados-atualizados']);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
};

const tratarErroAdmin = (err) => {
  const status = err.response?.status;
  if (status === 401) {
    erroAcesso.value = 'Sua sessão expirou. Faça login novamente.';
  } else if (status === 403) {
    erroAcesso.value = 'Você não tem permissão de acesso ao painel administrativo.';
  } else {
    erroAcesso.value = 'Erro ao comunicar com o servidor. Tente novamente.';
  }
};

const carregarPendentes = async () => {
  erroAcesso.value = '';
  const headers = getAuthHeaders();
  if (!headers) {
    erroAcesso.value = 'Sessão não encontrada. Faça login para acessar o painel.';
    return;
  }
  try {
    const res = await axios.get(`${API_URL}/admin/pendentes`, { headers });
    pendentes.value = res.data;
  } catch (err) {
    tratarErroAdmin(err);
    console.error("Erro ao buscar pendentes:", err);
  }
};

const aprovar = async (item) => {
  if (!confirm("Confirmar aprovação?")) return;
  const headers = getAuthHeaders();
  if (!headers) { erroAcesso.value = 'Sessão não encontrada. Faça login novamente.'; return; }
  try {
    await axios.put(`${API_URL}/admin/aprovar/${item.id}`, { tipo: item.tipo_item }, { headers });
    await carregarPendentes();
    emit('dados-atualizados');
  } catch (err) {
    tratarErroAdmin(err);
  }
};

const rejeitar = async (item) => {
  if (!confirm("Remover item?")) return;
  const headers = getAuthHeaders();
  if (!headers) { erroAcesso.value = 'Sessão não encontrada. Faça login novamente.'; return; }
  try {
    const rota = item.tipo_item === 'projeto' ? 'projetos' : 'ideias';
    await axios.delete(`${API_URL}/${rota}/${item.id}`, { headers });
    await carregarPendentes();
    emit('dados-atualizados');
  } catch (err) {
    tratarErroAdmin(err);
  }
};

onMounted(carregarPendentes);
</script>

<style scoped>
/* ─── Shell ─────────────────────────────────────────────────────────────────── */
.admin-shell {
  display: flex;
  min-height: calc(100vh - var(--cx-navbar-h));
  background: var(--cx-bg);
  font-family: var(--cx-font-sans);
}

/* ─── Sidebar ───────────────────────────────────────────────────────────────── */
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--cx-surface);
  border-right: 1px solid var(--cx-border);
  padding: var(--cx-space-8) var(--cx-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-6);
}

.admin-sidebar__head {
  display: flex;
  align-items: center;
  gap: var(--cx-space-3);
  padding: 0 var(--cx-space-3);
  margin-bottom: var(--cx-space-2);
}

.admin-sidebar__brand {
  font-size: var(--cx-text-lg);
  font-weight: 300;
  color: var(--cx-text-2);
  letter-spacing: -0.02em;
}

.admin-sidebar__brand strong {
  font-weight: 800;
  color: var(--cx-primary);
}

.admin-sidebar__tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cx-text-faint);
  background: var(--cx-bg-alt);
  border: 1px solid var(--cx-border);
  padding: 2px 7px;
  border-radius: var(--cx-radius-sm);
}

/* Nav */
.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-nav__item {
  display: flex;
  align-items: center;
  gap: var(--cx-space-3);
  background: none;
  border: none;
  font-family: var(--cx-font-sans);
  font-size: var(--cx-text-sm);
  font-weight: 500;
  color: var(--cx-text-muted);
  padding: 9px var(--cx-space-3);
  border-radius: var(--cx-radius-md);
  cursor: pointer;
  text-align: left;
  transition: background var(--cx-transition-fast), color var(--cx-transition-fast);
  position: relative;
}

.admin-nav__item:hover {
  background: var(--cx-bg);
  color: var(--cx-text);
}

.admin-nav__item--active {
  background: var(--cx-primary-light);
  color: var(--cx-primary-dark);
  font-weight: 600;
}

.admin-nav__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.7;
}

.admin-nav__item--active .admin-nav__icon {
  opacity: 1;
}

.admin-nav__badge {
  margin-left: auto;
  background: var(--cx-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: var(--cx-radius-full);
  line-height: 1.6;
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */
.admin-main {
  flex: 1;
  padding: var(--cx-space-8) var(--cx-space-10);
  overflow-y: auto;
}

.admin-section {
  max-width: 960px;
  margin: 0 auto;
}

.admin-section__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--cx-space-4);
  margin-bottom: var(--cx-space-8);
  border-bottom: 1px solid var(--cx-border-soft);
  padding-bottom: var(--cx-space-6);
}

.admin-section__title {
  font-size: var(--cx-text-2xl);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.03em;
  margin-bottom: var(--cx-space-1);
}

.admin-section__sub {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-muted);
}

.admin-refresh {
  display: flex;
  align-items: center;
  gap: var(--cx-space-2);
  background: none;
  border: 1px solid var(--cx-border);
  color: var(--cx-text-muted);
  font-size: var(--cx-text-sm);
  font-weight: 500;
  font-family: var(--cx-font-sans);
  padding: 7px 14px;
  border-radius: var(--cx-radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color var(--cx-transition-fast), color var(--cx-transition-fast);
  flex-shrink: 0;
}

.admin-refresh:hover {
  border-color: var(--cx-primary);
  color: var(--cx-primary);
}

/* Alert */
.admin-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--cx-space-3);
  padding: var(--cx-space-4) var(--cx-space-5);
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: var(--cx-space-6);
}

.admin-alert--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

/* Empty */
.admin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--cx-space-4);
  padding: var(--cx-space-20) var(--cx-space-8);
  color: var(--cx-text-faint);
  background: var(--cx-surface);
  border: 1px dashed var(--cx-border);
  border-radius: var(--cx-radius-xl);
}

.admin-empty p {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-muted);
}

/* Grid de cards */
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--cx-space-5);
}

.admin-card {
  background: var(--cx-surface);
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-xl);
  padding: var(--cx-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-4);
  transition: box-shadow var(--cx-transition-base);
}

.admin-card:hover {
  box-shadow: var(--cx-shadow-md);
}

.admin-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--cx-space-3);
}

.admin-card__meta {
  display: flex;
  align-items: center;
  gap: var(--cx-space-2);
  flex-wrap: wrap;
}

.admin-card__tipo {
  font-size: var(--cx-text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--cx-radius-full);
}

.admin-card__tipo--projeto {
  background: #dbeafe;
  color: #1d4ed8;
}

.admin-card__tipo--ideia {
  background: var(--cx-primary-light);
  color: var(--cx-primary-dark);
}

.admin-card__nicho {
  font-size: var(--cx-text-xs);
  color: var(--cx-text-muted);
  font-weight: 500;
}

.admin-card__loc {
  font-size: var(--cx-text-xs);
  color: var(--cx-text-faint);
  white-space: nowrap;
}

.admin-card__title {
  font-size: var(--cx-text-xl);
  font-weight: 700;
  color: var(--cx-text);
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.admin-card__desc {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-2);
  line-height: 1.7;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.admin-card__financial {
  display: flex;
  gap: var(--cx-space-8);
  padding: var(--cx-space-4) 0;
  border-top: 1px solid var(--cx-border-soft);
  border-bottom: 1px solid var(--cx-border-soft);
}

.admin-card__financial-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-card__financial-item span {
  font-size: var(--cx-text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--cx-text-muted);
  font-weight: 600;
}

.admin-card__financial-item strong {
  font-size: var(--cx-text-lg);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.02em;
}

.admin-card__foot {
  display: flex;
  gap: var(--cx-space-3);
}

/* Botões de ação */
.admin-btn {
  flex: 1;
  padding: 9px var(--cx-space-4);
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-weight: 600;
  font-family: var(--cx-font-sans);
  cursor: pointer;
  border: 1px solid transparent;
  transition: background var(--cx-transition-fast), border-color var(--cx-transition-fast), color var(--cx-transition-fast);
}

.admin-btn--approve {
  background: var(--cx-primary);
  color: #fff;
  border-color: var(--cx-primary);
}

.admin-btn--approve:hover {
  background: var(--cx-primary-dark);
  border-color: var(--cx-primary-dark);
}

.admin-btn--reject {
  background: transparent;
  color: #b91c1c;
  border-color: #fecaca;
}

.admin-btn--reject:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

/* ─── Responsivo ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-main { padding: var(--cx-space-6) var(--cx-space-5); }
  .admin-grid { grid-template-columns: 1fr; }
}
</style>