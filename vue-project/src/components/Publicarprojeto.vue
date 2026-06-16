<template>
  <div class="page-shell">
    <div class="page-inner">

      <!-- Cabeçalho da página -->
      <div class="page-header">
        <h1 class="page-header__title">Projetos</h1>
        <p class="page-header__sub">Publique seu negócio e conecte-se a investidores na plataforma.</p>
      </div>

      <div class="page-layout">

        <!-- Formulário lateral -->
        <aside class="page-form-col">
          <div class="cx-card">
            <h2 class="cx-card__title">Anunciar projeto</h2>
            <p class="cx-card__sub">Preencha os dados do seu negócio. Após envio, passará por revisão.</p>

            <form @submit.prevent="enviarProjeto" class="cx-form" novalidate>
              <div class="cx-field">
                <label for="proj-empresa">Nome da empresa</label>
                <input id="proj-empresa" v-model="novo.empresa" type="text" placeholder="Ex: HealthTech Ltda." required />
              </div>

              <div class="cx-field-row">
                <div class="cx-field">
                  <label for="proj-uf">UF</label>
                  <input id="proj-uf" v-model="novo.estado" type="text" placeholder="SP" maxlength="2" required />
                </div>
                <div class="cx-field cx-field--grow">
                  <label for="proj-cidade">Cidade</label>
                  <input id="proj-cidade" v-model="novo.cidade" type="text" placeholder="São Paulo" required />
                </div>
              </div>

              <div class="cx-field">
                <label for="proj-nicho">Nicho de atuação</label>
                <input id="proj-nicho" v-model="novo.nicho" type="text" placeholder="Ex: Saúde, Tecnologia, Varejo" required />
              </div>

              <div class="cx-field">
                <label for="proj-desc">Descrição do projeto</label>
                <textarea id="proj-desc" v-model="novo.descricao" placeholder="Descreva o que sua empresa faz e qual a oportunidade de investimento..." required rows="4"></textarea>
              </div>

              <div class="cx-field-row cx-field-row--equal">
                <div class="cx-field">
                  <label for="proj-valor">Captação (R$)</label>
                  <input id="proj-valor" v-model="novo.valor" type="number" placeholder="0" min="0" required />
                </div>
                <div class="cx-field">
                  <label for="proj-equity">Equity (%)</label>
                  <input id="proj-equity" v-model="novo.porcentagem" type="number" placeholder="0" min="0" max="100" required />
                </div>
              </div>

              <div class="cx-divider">
                <span>Contato para investidores</span>
              </div>

              <div class="cx-field">
                <label for="proj-email">E-mail de contato</label>
                <input id="proj-email" v-model="novo.email_contato" type="email" placeholder="contato@empresa.com" />
              </div>

              <div class="cx-field">
                <label for="proj-tel">WhatsApp / Telefone</label>
                <input id="proj-tel" v-model="novo.telefone" type="text" placeholder="+55 11 90000-0000" />
              </div>

              <button type="submit" class="cx-submit">Publicar projeto</button>
            </form>
          </div>
        </aside>

        <!-- Lista de projetos -->
        <section class="page-list-col" aria-labelledby="list-title">
          <h2 id="list-title" class="page-list-title">Projetos publicados</h2>

          <div v-if="projetos.length === 0" class="cx-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p>Nenhum projeto publicado ainda. Seja o primeiro.</p>
          </div>

          <div class="project-list">
            <article class="project-item" v-for="p in projetos" :key="p.id">
              <header class="project-item__head">
                <span class="project-item__badge">{{ p.nicho }}</span>
                <span class="project-item__loc">{{ p.cidade }}, {{ p.estado }}</span>
              </header>

              <h3 class="project-item__title">{{ p.empresa }}</h3>
              <p class="project-item__desc">{{ p.descricao }}</p>

              <footer class="project-item__foot">
                <div class="project-item__financials">
                  <div class="project-item__fin-item">
                    <span>Captação</span>
                    <strong>R$ {{ Number(p.valor).toLocaleString('pt-BR') }}</strong>
                  </div>
                  <div class="project-item__fin-divider" aria-hidden="true"></div>
                  <div class="project-item__fin-item">
                    <span>Equity</span>
                    <strong>{{ p.porcentagem }}%</strong>
                  </div>
                </div>

                <div class="project-item__actions">
                  <button class="cx-btn-action" @click="abrirContato(p)">Contato</button>
                  <button
                    v-if="user?.nivel === 'admin'"
                    class="cx-btn-action cx-btn-action--danger"
                    @click="$emit('excluir', p.id)"
                  >Excluir</button>
                </div>
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

const props = defineProps(['projetos', 'user']);
const emit = defineEmits(['salvar', 'excluir']);

const novo = ref({
  empresa: '',
  estado: '',
  cidade: '',
  nicho: '',
  descricao: '',
  valor: '',
  porcentagem: '',
  email_contato: '',
  telefone: ''
});

const enviarProjeto = () => {
  const projetoFinal = {
    ...novo.value,
    usuario_id: props.user?.id,
    status: 'pendente'
  };
  emit('salvar', projetoFinal);
  Object.keys(novo.value).forEach(key => novo.value[key] = '');
  alert("Projeto enviado com sucesso! Ele aparecerá na lista assim que o administrador aprová-lo.");
};

const abrirContato = (projeto) => {
  if (projeto.telefone) {
    const tel = projeto.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${tel}`, '_blank');
  } else if (projeto.email_contato) {
    window.location.href = `mailto:${projeto.email_contato}`;
  } else {
    alert("Este projeto não forneceu dados de contato direto.");
  }
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

/* Cabeçalho */
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

/* Layout */
.page-layout {
  display: flex;
  gap: var(--cx-space-20);
  align-items: flex-start;
}

.page-form-col {
  flex: 0 0 380px;
  position: sticky;
  top: calc(var(--cx-navbar-h) + var(--cx-space-6));
}

.page-list-col {
  flex: 1;
  min-width: 0;
}

/* Card do formulário */
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

.cx-field--grow { flex: 1; }

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
  transition: border-color var(--cx-transition-fast), box-shadow var(--cx-transition-fast);
  box-sizing: border-box;
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

.cx-field textarea {
  resize: vertical;
  min-height: 96px;
}

.cx-field-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: var(--cx-space-3);
}

.cx-field-row--equal {
  grid-template-columns: 1fr 1fr;
}

/* Divisor de seção do formulário */
.cx-divider {
  display: flex;
  align-items: center;
  gap: var(--cx-space-3);
  margin: var(--cx-space-2) 0;
}

.cx-divider span {
  font-size: var(--cx-text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cx-text-faint);
  white-space: nowrap;
}

.cx-divider::before,
.cx-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--cx-border-soft);
}

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
  letter-spacing: 0.02em;
  margin-top: var(--cx-space-2);
  transition: background var(--cx-transition-base), box-shadow var(--cx-transition-base);
}

.cx-submit:hover {
  background: var(--cx-primary-dark);
  box-shadow: var(--cx-shadow-primary);
}

/* Lista de projetos */
.page-list-title {
  font-size: var(--cx-text-xl);
  font-weight: 700;
  color: var(--cx-text);
  letter-spacing: -0.02em;
  margin-bottom: var(--cx-space-6);
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-4);
}

.project-item {
  background: var(--cx-surface);
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-xl);
  padding: var(--cx-space-6);
  transition: box-shadow var(--cx-transition-base), border-color var(--cx-transition-base);
}

.project-item:hover {
  box-shadow: var(--cx-shadow-md);
  border-color: rgba(13,156,110,0.15);
}

.project-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--cx-space-4);
}

.project-item__badge {
  font-size: var(--cx-text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cx-primary);
  background: var(--cx-primary-light);
  padding: 3px 10px;
  border-radius: var(--cx-radius-full);
}

.project-item__loc {
  font-size: var(--cx-text-xs);
  color: var(--cx-text-muted);
}

.project-item__title {
  font-size: var(--cx-text-xl);
  font-weight: 700;
  color: var(--cx-text);
  letter-spacing: -0.02em;
  margin-bottom: var(--cx-space-3);
}

.project-item__desc {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-2);
  line-height: 1.7;
  margin-bottom: var(--cx-space-6);
}

.project-item__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cx-space-4);
  border-top: 1px solid var(--cx-border-soft);
  padding-top: var(--cx-space-4);
  flex-wrap: wrap;
}

.project-item__financials {
  display: flex;
  align-items: center;
  gap: var(--cx-space-6);
}

.project-item__fin-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-item__fin-item span {
  font-size: var(--cx-text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--cx-text-muted);
  font-weight: 600;
}

.project-item__fin-item strong {
  font-size: var(--cx-text-xl);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.02em;
}

.project-item__fin-divider {
  width: 1px;
  height: 28px;
  background: var(--cx-border-soft);
}

.project-item__actions {
  display: flex;
  gap: var(--cx-space-3);
}

.cx-btn-action {
  padding: 7px 16px;
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-weight: 600;
  font-family: var(--cx-font-sans);
  cursor: pointer;
  border: 1px solid var(--cx-border);
  color: var(--cx-text-2);
  background: transparent;
  transition: border-color var(--cx-transition-fast), color var(--cx-transition-fast), background var(--cx-transition-fast);
}

.cx-btn-action:hover {
  border-color: var(--cx-primary);
  color: var(--cx-primary);
  background: var(--cx-primary-alpha);
}

.cx-btn-action--danger {
  color: #b91c1c;
  border-color: #fecaca;
}

.cx-btn-action--danger:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
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
  .project-item__foot { flex-direction: column; align-items: flex-start; }
}
</style>