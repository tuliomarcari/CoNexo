<template>
  <div class="admin-container">
    <aside class="sidebar">
      <div class="admin-tabs">
        <button :class="{ active: abaAtiva === 'tickets' }" @click="abaAtiva = 'tickets'">Negociações</button>
        <button :class="{ active: abaAtiva === 'pendentes' }" @click="abaAtiva = 'pendentes'; carregarPendentes()">
          Pendentes <span v-if="totalPendentes > 0" class="badge">{{ totalPendentes }}</span>
        </button>
      </div>

      <hr />

      <div v-if="abaAtiva === 'tickets'">
        <h2>Negociações Ativas</h2>
        <div 
          v-for="ticket in tickets" :key="ticket.id" 
          @click="selecionarTicket(ticket)"
          :class="['ticket-card', { active: ticketSelecionado?.id === ticket.id }]"
        >
          <p><strong>Projeto:</strong> {{ ticket.empresa }}</p>
          <p><strong>Interessado:</strong> {{ ticket.nome_cliente }}</p>
        </div>
      </div>

      <div v-else>
        <h2>Aguardando Aprovação</h2>
        <div v-for="p in pendentes.projetos" :key="p.id" class="pendente-card">
          <p><strong>{{ p.empresa }}</strong> ({{ p.nicho }})</p>
          <div class="acoes">
            <button @click="aprovarItem('projeto', p.id)" class="btn-aprovar">Aprovar</button>
          </div>
        </div>
        <div v-for="i in pendentes.ideias" :key="i.id" class="pendente-card ideia">
          <p><strong>{{ i.titulo }}</strong></p>
          <button @click="aprovarItem('ideia', i.id)" class="btn-aprovar">Aprovar</button>
        </div>
        <p v-if="totalPendentes === 0">Tudo aprovado!</p>
      </div>
    </aside>

    <main class="chat-area" v-if="ticketSelecionado && abaAtiva === 'tickets'">
      <header><h3>Chat: {{ ticketSelecionado.empresa }}</h3></header>
      <div class="messages-list">
        <div v-for="msg in mensagens" :key="msg.id" :class="['msg-bubble', msg.nivel]">
          <p>{{ msg.conteudo }}</p>
        </div>
      </div>
      <div class="chat-input">
        <input v-model="novaMensagem" @keyup.enter="enviarMensagem" placeholder="Responder..." />
        <button @click="enviarMensagem">Enviar</button>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
const API = 'https://conexo-api.onrender.com';

export default {
  data() {
    return {
      abaAtiva: 'tickets',
      tickets: [],
      pendentes: { projetos: [], ideias: [] },
      ticketSelecionado: null,
      mensagens: [],
      novaMensagem: '',
      usuarioLogado: JSON.parse(localStorage.getItem('usuario'))
    };
  },
  computed: { totalPendentes() { return this.pendentes.projetos.length + this.pendentes.ideias.length; } },
  methods: {
    async carregarTickets() {
      const res = await axios.get(`${API}/admin/tickets`);
      this.tickets = res.data;
    },
    async carregarPendentes() {
      const res = await axios.get(`${API}/admin/pendentes`);
      this.pendentes = res.data;
    },
    async selecionarTicket(t) {
      this.ticketSelecionado = t;
      const res = await axios.get(`${API}/tickets/${t.id}/mensagens`);
      this.mensagens = res.data;
    },
    async aprovarItem(tipo, id) {
      await axios.patch(`${API}/admin/aprovar/${tipo}/${id}`);
      this.carregarPendentes();
      alert("Item aprovado e publicado!");
    },
    async enviarMensagem() {
      if (!this.novaMensagem.trim()) return;
      await axios.post(`${API}/mensagens`, { ticket_id: this.ticketSelecionado.id, remetente_id: this.usuarioLogado.id, conteudo: this.novaMensagem });
      this.mensagens.push({ conteudo: this.novaMensagem, nivel: 'admin' });
      this.novaMensagem = '';
    }
  },
  mounted() { this.carregarTickets(); this.carregarPendentes(); }
};
</script>

<style scoped>
.admin-container { display: flex; height: 90vh; color: white; background: #0b0e11; }
.sidebar { width: 350px; border-right: 1px solid #333; padding: 20px; }
.admin-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
.admin-tabs button { flex: 1; padding: 10px; border-radius: 5px; cursor: pointer; background: #222; color: #888; border: 1px solid #444; }
.admin-tabs button.active { background: #00c896; color: white; border: none; }
.pendente-card { background: #1a1d21; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #00c896; }
.btn-aprovar { background: #00c896; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 10px; }
.chat-area { flex: 1; display: flex; flex-direction: column; padding: 20px; }
.messages-list { flex: 1; overflow-y: auto; background: #16191c; border-radius: 10px; padding: 15px; }
.msg-bubble.admin { background: #00c896; align-self: flex-end; margin-left: auto; }
</style>