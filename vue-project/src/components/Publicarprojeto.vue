<template>
  <div class="container-interno">
    <div class="header-section">
      <h1>Projetos Publicados</h1>
      <p>Apresente seu negócio para a rede de investidores.</p>
    </div>
    <div class="grid-layout">
      <aside class="form-column">
        <div class="card-base">
          <h3>Anunciar Novo Negócio</h3>
          <form @submit.prevent="enviar">
            <input v-model="form.empresa" placeholder="Nome da Empresa" required />
            <div class="row">
              <input v-model="form.estado" placeholder="UF" required />
              <input v-model="form.cidade" placeholder="Cidade" required />
            </div>
            <input v-model="form.nicho" placeholder="Nicho de atuação" required />
            <textarea v-model="form.descricao" placeholder="Descrição..." rows="4" required></textarea>
            <div class="row">
              <input v-model="form.valor" placeholder="Valor (R$)" required />
              <input v-model="form.porcentagem" placeholder="Equity (%)" required />
            </div>
            <button type="submit" class="btn-primary">Publicar Agora</button>
          </form>
        </div>
      </aside>
      <section class="list-column">
        <h3>Lista de Projetos</h3>
        <div v-if="projetos.length > 0" class="cards-stack">
          <div v-for="p in projetos" :key="p.id" class="card-base">
            <div class="card-top">
              <span class="badge">{{ p.nicho }}</span>
              <div class="top-right">
                <small>📍 {{ p.cidade }}/{{ p.estado }}</small>
                <button 
                  v-if="user && user.nivel === 'admin'" 
                  @click="$emit('excluir', p.id)" 
                  class="btn-delete" 
                  title="Excluir Projeto"
                >
                  🗑️
                </button>
              </div>
            </div>
            <h4>{{ p.empresa }}</h4>
            <p class="desc">{{ p.descricao }}</p>
            <div class="item-footer">
              <div class="vals">
                <span>R$ {{ p.valor }}</span>
                <span>{{ p.porcentagem }}% Equity</span>
              </div>
              <button class="btn-talk">Conversar</button>
            </div>
          </div>
        </div>
        <div v-else class="empty">Nenhum projeto encontrado.</div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Agora recebemos 'user' do App.vue
const props = defineProps(['projetos', 'user']);
// Adicionamos 'excluir' aos eventos emitidos
const emit = defineEmits(['salvar', 'excluir']);

const form = ref({ empresa: '', estado: '', cidade: '', nicho: '', descricao: '', valor: '', porcentagem: '' });

const enviar = () => { 
  emit('salvar', { ...form.value }); 
  form.value = { empresa: '', estado: '', cidade: '', nicho: '', descricao: '', valor: '', porcentagem: '' }; 
};
</script>

<style scoped>
.container-interno { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.grid-layout { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }
.card-base { background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; position: relative; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
input, textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; }
.btn-primary { width: 100%; background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.badge { background: #ecfdf5; color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }

.card-top { display: flex; justify-content: space-between; align-items: center; }
.top-right { display: flex; align-items: center; gap: 10px; }

/* Estilo do Botão de Apagar */
.btn-delete { 
  background: #fee2e2; 
  border: none; 
  padding: 5px 8px; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: 0.2s;
  font-size: 0.9rem;
}
.btn-delete:hover { background: #fecaca; transform: scale(1.1); }

.desc { color: #64748b; font-size: 0.9rem; margin: 10px 0; }
.item-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 15px; }
.vals { display: flex; gap: 15px; font-weight: bold; color: #10b981; }
.btn-talk { background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; }
.empty { text-align: center; padding: 40px; color: #94a3b8; background: #fff; border-radius: 12px; border: 1px dashed #e2e8f0; }
</style>