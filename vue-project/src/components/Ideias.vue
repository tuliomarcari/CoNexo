<template>
  <div class="page-shell">
    <div class="page-inner">

      <div class="page-header">
        <h1 class="page-header__title">Ideias</h1>
        <p class="page-header__sub">Proponha soluções e valide conceitos com a comunidade CoNexo.</p>
      </div>

      <div class="page-layout">

        <!-- Formulário -->
        <aside class="page-form-col">
          <div class="cx-card">
            <h2 class="cx-card__title">Nova sugestão</h2>
            <p class="cx-card__sub">Compartilhe uma ideia de negócio ou solução para um nicho específico.</p>

            <form @submit.prevent="enviar" class="cx-form" novalidate>
              <div class="cx-field">
                <label for="ideia-nicho">Nicho</label>
                <select id="ideia-nicho" v-model="form.nicho" required>
                  <option value="" disabled>Selecione um nicho</option>
                  <option value="TECNOLOGIA">Tecnologia</option>
                  <option value="SAÚDE">Saúde</option>
                  <option value="EDUCAÇÃO">Educação</option>
                  <option value="VAREJO">Varejo</option>
                  <option value="FINANÇAS">Finanças</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div class="cx-field">
                <label for="ideia-titulo">Título da ideia</label>
                <input
                  id="ideia-titulo"
                  v-model="form.titulo"
                  type="text"
                  placeholder="Um nome claro e direto"
                  required
                />
              </div>

              <div class="cx-field">
                <label for="ideia-desc">Descrição</label>
                <textarea
                  id="ideia-desc"
                  v-model="form.descricao"
                  placeholder="Explique o problema que resolve, o público-alvo e por que acredita nessa ideia..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" class="cx-submit">Enviar ideia</button>
            </form>
          </div>
        </aside>

        <!-- Lista de ideias -->
        <section class="page-list-col" aria-labelledby="ideias-title">
          <h2 id="ideias-title" class="page-list-title">Ideias aprovadas</h2>

          <div v-if="ideias.length === 0" class="cx-empty" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>Nenhuma ideia publicada ainda. Seja o primeiro a contribuir.</p>
          </div>

          <div class="ideias-list" v-else>
            <article class="ideia-card" v-for="item in ideias" :key="item.id">
              <header class="ideia-card__head">
                <span class="ideia-card__badge">{{ item.nicho }}</span>
                <button
                  v-if="user && user.nivel === 'admin'"
                  class="ideia-card__delete"
                  @click="$emit('excluir', item.id)"
                  title="Remover ideia"
                  aria-label="Remover ideia"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </header>

              <h3 class="ideia-card__title">{{ item.titulo }}</h3>
              <p class="ideia-card__desc">{{ item.descricao }}</p>

              <footer class="ideia-card__foot">
                <span class="ideia-card__date" v-if="item.data_criacao">
                  {{ new Date(item.data_criacao).toLocaleDateString('pt-BR') }}
                </span>
              </footer>
            </article>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['ideias', 'user']);
const emit = defineEmits(['nova-ideia', 'excluir']);

const form = ref({ titulo: '', nicho: '', descricao: '' });

const enviar = () => {
  emit('nova-ideia', { ...form.value });
  form.value = { titulo: '', nicho: '', descricao: '' };
};
</script>

<style scoped>
.page-shell {
  background: var(--cx-bg);
  min-height: calc(100vh - var(--cx-navbar-h));
}

.page-inner {
  max-width: var(--cx-container);
  margin: 0 auto;
  padding: var(--cx-space-12) var(--cx-space-8);
}

.page-header {
  margin-bottom: var(--cx-space-10);
  border-bottom: 1px solid var(--cx-border-soft);
  padding-bottom: var(--cx-space-6);
}

.page-header__title {
  font-size: var(--cx-text-3xl);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.03em;
  margin-bottom: var(--cx-space-2);
}

.page-header__sub {
  font-size: var(--cx-text-base);
  color: var(--cx-text-muted);
}

.page-layout {
  display: flex;
  gap: var(--cx-space-20);
  align-items: flex-start;
}

.page-form-col {
  flex: 0 0 360px;
  position: sticky;
  top: calc(var(--cx-navbar-h) + var(--cx-space-6));
}

.page-list-col { flex: 1; min-width: 0; }

/* Card */
.cx-card {
  background: var(--cx-surface);
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-xl);
  padding: var(--cx-space-8);
}

.cx-card__title {
  font-size: var(--cx-text-xl);
  font-weight: 700;
  color: var(--cx-text);
  letter-spacing: -0.02em;
  margin-bottom: var(--cx-space-2);
}

.cx-card__sub {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-muted);
  margin-bottom: var(--cx-space-6);
  line-height: 1.6;
}

/* Formulário */
.cx-form {
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-4);
}

.cx-field {
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-2);
}

.cx-field label {
  font-size: var(--cx-text-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cx-text-2);
}

.cx-field input,
.cx-field textarea,
.cx-field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-family: var(--cx-font-sans);
  color: var(--cx-text);
  background: var(--cx-bg);
  box-sizing: border-box;
  transition: border-color var(--cx-transition-fast), box-shadow var(--cx-transition-fast);
}

.cx-field input::placeholder,
.cx-field textarea::placeholder {
  color: var(--cx-text-faint);
}

.cx-field input:focus,
.cx-field textarea:focus,
.cx-field select:focus {
  outline: none;
  border-color: var(--cx-primary);
  box-shadow: 0 0 0 3px var(--cx-primary-alpha);
  background: var(--cx-surface);
}

.cx-field textarea { resize: vertical; min-height: 110px; }

.cx-submit {
  width: 100%;
  padding: 11px;
  background: var(--cx-primary);
  color: #fff;
  border: none;
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-weight: 600;
  font-family: var(--cx-font-sans);
  cursor: pointer;
  margin-top: var(--cx-space-2);
  transition: background var(--cx-transition-base), box-shadow var(--cx-transition-base);
}

.cx-submit:hover {
  background: var(--cx-primary-dark);
  box-shadow: var(--cx-shadow-primary);
}

/* Lista */
.page-list-title {
  font-size: var(--cx-text-xl);
  font-weight: 700;
  color: var(--cx-text);
  letter-spacing: -0.02em;
  margin-bottom: var(--cx-space-6);
}

.ideias-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--cx-space-5);
}

.ideia-card {
  background: var(--cx-surface);
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-xl);
  padding: var(--cx-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-3);
  transition: box-shadow var(--cx-transition-base), border-color var(--cx-transition-base);
}

.ideia-card:hover {
  box-shadow: var(--cx-shadow-md);
  border-color: rgba(13,156,110,0.15);
}

.ideia-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ideia-card__badge {
  font-size: var(--cx-text-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--cx-primary);
  background: var(--cx-primary-light);
  padding: 3px 10px;
  border-radius: var(--cx-radius-full);
}

.ideia-card__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-md);
  color: var(--cx-text-faint);
  cursor: pointer;
  transition: border-color var(--cx-transition-fast), color var(--cx-transition-fast), background var(--cx-transition-fast);
}

.ideia-card__delete:hover {
  border-color: #ef4444;
  color: #b91c1c;
  background: #fef2f2;
}

.ideia-card__title {
  font-size: var(--cx-text-lg);
  font-weight: 700;
  color: var(--cx-text);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.ideia-card__desc {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-2);
  line-height: 1.7;
  flex: 1;
}

.ideia-card__foot {
  border-top: 1px solid var(--cx-border-soft);
  padding-top: var(--cx-space-3);
}

.ideia-card__date {
  font-size: var(--cx-text-xs);
  color: var(--cx-text-faint);
  letter-spacing: 0.03em;
}

/* Empty state */
.cx-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--cx-space-4);
  padding: var(--cx-space-16) var(--cx-space-8);
  color: var(--cx-text-faint);
  background: var(--cx-surface);
  border: 1px dashed var(--cx-border);
  border-radius: var(--cx-radius-xl);
  text-align: center;
}

.cx-empty p {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-muted);
}

/* Responsivo */
@media (max-width: 900px) {
  .page-layout { flex-direction: column; }
  .page-form-col { flex: none; width: 100%; position: static; }
}

@media (max-width: 640px) {
  .page-inner { padding: var(--cx-space-6) var(--cx-space-5); }
  .ideias-list { grid-template-columns: 1fr; }
}
</style>