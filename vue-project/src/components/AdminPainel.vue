<template>
  <div class="admin-container">
    <aside class="sidebar">
      <h2>Negociações Ativas</h2>
      <div 
        v-for="ticket in tickets" 
        :key="ticket.id" 
        @click="selecionarTicket(ticket)"
        :class="['ticket-card', { active: ticketSelecionado?.id === ticket.id }]"
      >
        <p><strong>Projeto:</strong> {{ ticket.empresa }}</p>
        <p><strong>Interessado:</strong> {{ ticket.nome_cliente }}</p>
        <span class="status-badge">{{ ticket.status }}</span>
      </div>
    </aside>

    <main class="chat-area" v-if="ticketSelecionado">
      <header>
        <h3>Intermediando: {{ ticketSelecionado.empresa }}</h3>
      </header>
      
      <div class="messages-list" ref="chatWindow">
        <div 
          v-for="msg in mensagens" 
          :key="msg.id" 
          :class="['msg-bubble', msg.nivel === 'admin' ? 'admin' : 'user']"
        >
          <small>{{ msg.nome_remetente }} ({{ msg.nivel }})</small>
          <p>{{ msg.conteudo }}</p>
        </div>
      </div>

      <div class="chat-input">
        <input v-model="novaMensagem" @keyup.enter="enviarMensagem" placeholder="Escreva como mediador..." />
        <button @click="enviarMensagem">Enviar</button>
      </div>
    </main>
    
    <div v-else class="no-selection">
      <p>Selecione uma negociação ao lado para começar a mediação.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      tickets: [],
      ticketSelecionado: null,
      mensagens: [],
      novaMensagem: '',
      usuarioLogado: JSON.parse(localStorage.getItem('usuario')) // Pega o Joao Baldacin logado
    };
  },
  methods: {
    async carregarTickets() {
      try {
        const res = await axios.get('https://conexo-api.onrender.com/admin/tickets');
        this.tickets = res.data;
      } catch (err) {
        console.error("Erro ao carregar painel admin", err);
      }
    },
    async selecionarTicket(ticket) {
      this.ticketSelecionado = ticket;
      const res = await axios.get(`https://conexo-api.onrender.com/tickets/${ticket.id}/mensagens`);
      this.mensagens = res.data;
    },
    async enviarMensagem() {
      if (!this.novaMensagem.trim()) return;
      
      const payload = {
        ticket_id: this.ticketSelecionado.id,
        remetente_id: this.usuarioLogado.id,
        conteudo: this.novaMensagem
      };

      try {
        await axios.post('https://conexo-api.onrender.com/mensagens', payload);
        this.mensagens.push({
          nome_remetente: this.usuarioLogado.nome,
          nivel: 'admin',
          conteudo: this.novaMensagem
        });
        this.novaMensagem = '';
      } catch (err) {
        alert("Erro ao enviar mensagem.");
      }
    }
  },
  mounted() {
    this.carregarTickets();
  }
};
</script>

<style scoped>
.admin-container { display: flex; height: 80vh; background: #f4f7f6; }
.sidebar { width: 300px; border-right: 1px solid #ddd; padding: 20px; overflow-y: auto; }
.ticket-card { padding: 15px; background: white; margin-bottom: 10px; cursor: pointer; border-radius: 8px; border-left: 5px solid #00c896; transition: 0.3s; }
.ticket-card.active { background: #e0fff7; }
.chat-area { flex: 1; display: flex; flex-direction: column; padding: 20px; }
.messages-list { flex: 1; overflow-y: auto; padding: 10px; background: white; border-radius: 8px; }
.msg-bubble { margin-bottom: 15px; padding: 10px; border-radius: 8px; max-width: 70%; }
.msg-bubble.admin { align-self: flex-end; background: #00c896; color: white; margin-left: auto; }
.msg-bubble.user { background: #eee; }
.chat-input { display: flex; margin-top: 15px; gap: 10px; }
.chat-input input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
.status-badge { font-size: 10px; text-transform: uppercase; color: #666; }
</style>