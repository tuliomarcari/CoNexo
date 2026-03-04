<template>
  <div class="projects-container">
    <div class="content-header">
      <h1 class="page-title">Projetos Publicados</h1>
      <p class="page-subtitle">Apresente seu negócio para a rede de investidores.</p>
    </div>

    <div class="main-layout">
      <aside class="form-column">
        <div class="cx-card form-card">
          <h2 class="form-title">Anunciar Novo Negócio</h2>
          
          <form @submit.prevent="enviarProjeto">
            <div class="form-group">
              <input v-model="novo.empresa" type="text" placeholder="Nome da Empresa" required class="cx-input" />
            </div>

            <div class="row-inputs">
              <input v-model="novo.estado" type="text" placeholder="UF" maxlength="2" required class="cx-input" />
              <input v-model="novo.cidade" type="text" placeholder="Cidade" required class="cx-input" />
            </div>

            <div class="form-group">
              <input v-model="novo.nicho" type="text" placeholder="Nicho de atuação" required class="cx-input" />
            </div>

            <div class="form-group">
              <textarea v-model="novo.descricao" placeholder="Descrição do projeto..." required class="cx-input cx-textarea"></textarea>
            </div>

            <div class="row-inputs">
              <div class="input-with-label">
                <label>Valor (R$)</label>
                <input v-model="novo.valor" type="number" placeholder="0,00" required class="cx-input" />
              </div>
              <div class="input-with-label">
                <label>Equity (%)</label>
                <input v-model="novo.porcentagem" type="number" placeholder="0" required class="cx-input" />
              </div>
            </div>

            <div class="contact-section">
              <p class="section-label">Contato Principal</p>
              <div class="form-group">
                <input v-model="novo.email_contato" type="email" placeholder="E-mail de contato" class="cx-input" />
              </div>
              <div class="form-group">
                <input v-model="novo.telefone" type="text" placeholder="Telefone / WhatsApp" class="cx-input" />
              </div>
            </div>

            <button type="submit" class="cx-btn-primary">Publicar Agora</button>
          </form>
        </div>
      </aside>

      <section class="list-column">
        <h2 class="list-title">Lista de Projetos</h2>
        
        <div v-if="projetos.length === 0" class="empty-state">
          Nenhum projeto publicado ainda.
        </div>

        <div v-for="p in projetos" :key="p.id" class="cx-card project-item">
          <div class="project-header">
            <span class="category-tag">{{ p.nicho }}</span>
            <span class="location-tag">📍 {{ p.cidade }} /{{ p.estado }}</span>
          </div>

          <h3 class="company-name">{{ p.empresa }}</h3>
          <p class="project-description">{{ p.descricao }}</p>

          <div class="project-footer">
            <div class="financials">
              <span class="price">R$ {{ Number(p.valor).toLocaleString() }}</span>
              <span class="equity">{{ p.porcentagem }}% Equity</span>
            </div>
            
            <div class="actions">
              <button @click="abrirContato(p)" class="btn-conversar">Conversar</button>
              <button v-if="user?.nivel === 'admin'" @click="$emit('excluir', p.id)" class="btn-excluir">Excluir</button>
            </div>
          </div>
        </div>
      </section>
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
  emit('salvar', { ...novo.value, usuario_id: props.user?.id });
  // Limpar campos
  Object.keys(novo.value).forEach(key => novo.value[key] = '');
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
.projects-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.content-header { margin-bottom: 40px; }
.page-title { font-size: 2rem; color: #0f172a; margin: 0; }
.page-subtitle { color: #64748b; font-size: 1.1rem; }

.main-layout { display: flex; gap: 40px; align-items: flex-start; }

/* Cards e Inputs Estilizados */
.cx-card { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 24px; border: 1px solid #f1f5f9; }
.cx-input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
.cx-input:focus { border-color: #10b981; outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
.cx-textarea { min-height: 100px; resize: vertical; }

/* Formulário */
.form-column { flex: 0 0 380px; }
.form-title { font-size: 1.25rem; margin-bottom: 20px; color: #1e293b; }
.form-group { margin-bottom: 15px; }
.row-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
.input-with-label label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 5px; font-weight: 600; }
.contact-section { margin: 20px 0; padding-top: 15px; border-top: 1px dashed #e2e8f0; }
.section-label { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-bottom: 10px; }

.cx-btn-primary { width: 100%; padding: 14px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.cx-btn-primary:hover { background: #059669; }

/* Lista de Projetos */
.list-column { flex: 1; }
.list-title { font-size: 1.25rem; margin-bottom: 25px; color: #1e293b; }
.project-item { margin-bottom: 20px; }
.project-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.category-tag { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.location-tag { font-size: 0.85rem; color: #64748b; }
.company-name { font-size: 1.3rem; margin: 10px 0; color: #0f172a; }
.project-description { color: #475569; line-height: 1.6; font-size: 0.95rem; margin-bottom: 20px; }

.project-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 15px; }
.financials { display: flex; gap: 15px; align-items: center; }
.price { color: #10b981; font-weight: 800; font-size: 1.1rem; }
.equity { color: #64748b; font-weight: 600; }

.actions { display: flex; gap: 10px; }
.btn-conversar { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-excluir { background: #fee2e2; color: #ef4444; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }

@media (max-width: 900px) {
  .main-layout { flex-direction: column; }
  .form-column { width: 100%; flex: none; }
}
</style>