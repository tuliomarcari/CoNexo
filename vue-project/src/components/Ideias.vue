<template>
  <div class="container-interno">
    <div class="header-section">
      <h1>Proponha uma Ideia</h1>
      <p>Troque conhecimentos e valide sua proposta.</p>
    </div>
    <div class="grid-layout">
      <aside class="form-column">
        <div class="card-base">
          <h3>Nova Sugestão</h3>
          <form @submit.prevent="enviar">
            <select v-model="form.nicho" required style="width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <option value="" disabled>Selecione um nicho</option>
              <option value="TECNOLOGIA">Tecnologia</option>
              <option value="SAÚDE">Saúde</option>
              <option value="EDUCAÇÃO">Educação</option>
            </select>
            <input v-model="form.titulo" placeholder="Título" required style="width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e2e8f0;"/>
            <textarea v-model="form.descricao" placeholder="Sua ideia..." rows="5" required style="width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e2e8f0;"></textarea>
            <button type="submit" class="btn-primary">Enviar Ideia</button>
          </form>
        </div>
      </aside>
      <section class="list-column">
        <h3>Ideias Recentes</h3>
        <div v-if="ideias.length > 0">
          <div v-for="item in ideias" :key="item.id" class="card-base">
            <div class="card-header-admin">
              <span class="badge">{{ item.nicho }}</span>
              <button 
                v-if="user && user.nivel === 'admin'" 
                @click="$emit('excluir', item.id)" 
                class="btn-delete-small"
                title="Excluir Ideia"
              >
                🗑️
              </button>
            </div>
            <h4 style="margin: 10px 0;">{{ item.titulo }}</h4>
            <p style="color: #64748b;">{{ item.descricao }}</p>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 50px; color: #94a3b8;">Nenhuma ideia ainda.</div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Recebemos o usuário e a lista de ideias
const props = defineProps(['ideias', 'user']);
const emit = defineEmits(['nova-ideia', 'excluir']);

const form = ref({ titulo: '', nicho: '', descricao: '' });

const enviar = () => { 
  emit('nova-ideia', { ...form.value }); 
  form.value = { titulo: '', nicho: '', descricao: '' }; 
};
</script>

<style scoped>
.container-interno { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.grid-layout { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }
.card-base { background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; }

/* Estilos para o cabeçalho do card com botão admin */
.card-header-admin { display: flex; justify-content: space-between; align-items: flex-start; }

.btn-delete-small {
  background: #fee2e2;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: 0.2s;
}

.btn-delete-small:hover { background: #fecaca; transform: scale(1.1); }

.btn-primary { width: 100%; background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.badge { background: #ecfdf5; color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
</style>