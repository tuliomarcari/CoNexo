<template>
  <div class="chat-container">
    <div class="chat-box">
      <header class="chat-header">
        <button class="btn-voltar" @click="$emit('voltar')">← Voltar</button>
        <h2>Negociando: {{ projeto?.empresa }}</h2>
      </header>
      
      <div class="chat-content">
        <aside class="info-sidebar">
          <h3>Resumo</h3>
          <p><strong>Valor:</strong> R$ {{ Number(projeto?.valor || 0).toLocaleString('pt-BR') }}</p>
          <p><strong>Equity:</strong> {{ projeto?.porcentagem || 0 }}%</p>
        </aside>

        <section class="messages-section">
          <div class="messages-history" ref="chatWindow">
            <div v-for="m in mensagens" :key="m.id" :class="['msg-bubble', m.remetente_id === usuario?.id ? 'me' : 'other']">
              <span class="msg-author">{{ m.autor_nome }}</span>
              <p>{{ m.texto }}</p>
            </div>
          </div>
          <form class="input-container" @submit.prevent="enviar">
            <input v-model="novaMsg" placeholder="Sua mensagem..." required />
            <button type="submit" class="btn-send">Enviar</button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
const props = defineProps(['projeto', 'usuario']);
const mensagens = ref([]);
const novaMsg = ref('');
const chatWindow = ref(null);

const carregarMensagens = async () => {
  const res = await fetch(`http://localhost:3001/mensagens/${props.projeto.id}/${props.usuario.id}`);
  if (res.ok) {
    mensagens.value = await res.json();
    await nextTick();
    if (chatWindow.value) chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

const enviar = async () => {
  const destinatario = props.projeto.usuario_id || props.projeto.dono_id;
  const payload = { 
    projeto_id: props.projeto.id, autor_nome: props.usuario.nome, 
    texto: novaMsg.value, remetente_id: props.usuario.id, destinatario_id: destinatario 
  };
  await fetch('http://localhost:3001/mensagens', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  novaMsg.value = '';
  carregarMensagens();
};

let intv;
onMounted(() => { carregarMensagens(); intv = setInterval(carregarMensagens, 4000); });
onUnmounted(() => clearInterval(intv));
</script>

<style scoped>
.chat-container { padding: 20px; height: 85vh; display: flex; justify-content: center; }
.chat-box { background: white; width: 100%; max-width: 1000px; display: flex; flex-direction: column; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.chat-header { background: #051614; color: white; padding: 15px; display: flex; align-items: center; gap: 20px; }
.chat-content { display: grid; grid-template-columns: 250px 1fr; flex: 1; overflow: hidden; }
.info-sidebar { background: #f8fafc; padding: 20px; border-right: 1px solid #eee; }
.messages-history { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.msg-bubble { max-width: 70%; padding: 10px; border-radius: 8px; }
.me { align-self: flex-end; background: #10b981; color: white; }
.other { align-self: flex-start; background: #e2e8f0; }
.input-container { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; }
.input-container input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
.btn-send { background: #10b981; color: white; border: none; padding: 0 20px; border-radius: 5px; cursor: pointer; }
</style>