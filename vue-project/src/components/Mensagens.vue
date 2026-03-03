<template>
  <div class="mensagens-container">
    <div class="header">
      <h2>Minha Caixa de Entrada</h2>
      <p>Gerencie as propostas e conversas recebidas nos seus projetos.</p>
    </div>

    <div v-if="conversas.length > 0" class="lista-conversas">
      <div v-for="conversa in conversas" :key="conversa.projeto_id" class="card-conversa">
        <div class="info-projeto">
          <span class="tag-projeto">{{ conversa.empresa }}</span>
          <h3>Interessado: {{ conversa.autor_nome }}</h3>
          <p class="ultima-msg">"{{ conversa.ultima_msg }}"</p>
        </div>
        <div class="acoes">
          <button class="btn-abrir" @click="$emit('abrir-chat', conversa)">
            Responder Conversa
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="icon">✉️</div>
      <h3>Nenhuma mensagem ainda</h3>
      <p>Quando alguém se interessar pelos seus projetos, as conversas aparecerão aqui.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['usuario']);
const emit = defineEmits(['abrir-chat']);
const conversas = ref([]);

const carregarConversas = async () => {
  if (!props.usuario) return;
  
  try {
    const res = await fetch(`https://conexo-api.onrender.com/minhas-conversas/${props.usuario.id}`);
    if (res.ok) {
      conversas.value = await res.json();
    }
  } catch (err) {
    console.error("Erro ao carregar conversas:", err);
  }
};

onMounted(carregarConversas);
</script>

<style scoped>
.mensagens-container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
.header { margin-bottom: 30px; }
.header h2 { color: #1e293b; font-size: 1.8rem; }
.header p { color: #64748b; }

.lista-conversas { display: flex; flex-direction: column; gap: 15px; }

.card-conversa {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.2s;
}

.card-conversa:hover { border-color: #10b981; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.tag-projeto {
  background: #dcfce7;
  color: #166534;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.info-projeto h3 { margin: 10px 0 5px; color: #1e293b; font-size: 1.1rem; }
.ultima-msg { color: #64748b; font-style: italic; font-size: 0.95rem; }

.btn-abrir {
  background: #051614;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.btn-abrir:hover { background: #10b981; }

.empty-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
  color: #94a3b8;
}

.empty-state .icon { font-size: 3rem; margin-bottom: 10px; }
</style>