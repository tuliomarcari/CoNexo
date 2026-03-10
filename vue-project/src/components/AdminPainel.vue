<template>
  <div class="admin-container">
    <aside class="sidebar">
      <div class="admin-tabs">
        <button :class="{ active: abaAtiva === 'tickets' }" @click="abaAtiva = 'tickets'">
          📂 Negociações
        </button>
        <button :class="{ active: abaAtiva === 'pendentes' }" @click="abaAtiva = 'pendentes'; carregarPendentes()">
          ⏳ Pendentes <span v-if="totalPendentes > 0" class="badge">{{ totalPendentes }}</span>
        </button>
      </div>

      <hr />

      <div v-if="abaAtiva === 'tickets'">
        <h2 class="section-title">Negociações Ativas</h2>
        <div 
          v-for="ticket in tickets" :key="ticket.id" 
          @click="selecionarTicket(ticket)"
          :class="['ticket-card', { active: ticketSelecionado?.id === ticket.id }]"
        >
          <p><strong>Projeto:</strong> {{ ticket.empresa }}</p>
          <p><strong>Interessado:</strong> {{ ticket.nome_cliente }}</p>
        </div>
      </div>

      <div v-else class="modificacao-lista">
        <h2 class="section-title">Aguardando Aprovação</h2>
        
        <div v-if="pendentes.projetos.length > 0">
          <h3>Projetos</h3>
          <div v-for="p in pendentes.projetos" :key="p.id" class="pendente-card">
            <p><strong>{{ p.empresa }}</strong></p>
            <button @click="aprovarItem('projeto', p.id)" class="btn-aprovar">✅ Aprovar Agora</button>
          </div>
        </div>

        <div v-if="pendentes.ideias.length > 0">
          <h3>Ideias</h3>
          <div v-for="i in pendentes.ideias" :key="i.id" class="pendente-card ideia">
            <p><strong>{{ i.titulo }}</strong></p>
            <button @click="aprovarItem('ideia', i.id)" class="btn-aprovar">✅ Aprovar Agora</button>
          </div>
        </div>

        <p v-if="totalPendentes === 0" class="empty-msg">Nenhum item pendente.</p>
      </div>
    </aside>

    <main class="chat-area" v-if="ticketSelecionado && abaAtiva === 'tickets'">
      <header class="chat-header">
        <h3>Mediando: {{ ticketSelecionado.empresa }}</h3>
      </header>
      
      <div class="messages-list">
        <div v-for="msg in mensagens" :key="msg.id" :class="['msg-bubble', msg.nivel]">
          <small>{{ msg.nome_remetente }}</small>
          <p>{{ msg.conteudo }}</p>
        </div>
      </div>

      <div class="chat-input">
        <input v-model="novaMensagem" @keyup.enter="enviarMensagem" placeholder="Escreva aqui..." />
        <button @click="enviarMensagem">Enviar</button>
      </div>
    </main>
    
    <div v-else class="no-selection">
      <p>Selecione um item na lateral para gerenciar.</p>
    </div>
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
  computed: {
    totalPendentes() { return this.pendentes.projetos.length + this.pendentes.ideias.length; }
  },
  methods: {
    async carregarTickets() {
      try {
        const res = await axios.get(`${API}/admin/tickets`);
        this.tickets = res.data;
      } catch (err) { console.error(err); }
    },
    async carregarPendentes() {
      try {
        const res = await axios.get(`${API}/admin/pendentes`);
        this.pendentes = res.data;
      } catch (err) { console.error(err); }
    },
    async selecionarTicket(t) {
      this.ticketSelecionado = t;
      const res = await axios.get(`${API}/tickets/${t.id}/mensagens`);
      this.mensagens = res.data;
    },
    async aprovarItem(tipo, id) {
      try {
        await axios.patch(`${API}/admin/aprovar/${tipo}/${id}`);
        alert("Sucesso! O item agora é público.");
        this.carregarPendentes();
      } catch (err) { alert("Erro na aprovação."); }
    },
    async enviarMensagem() {
      if (!this.novaMensagem.trim()) return;
      try {
        await axios.post(`${API}/mensagens`, {
          ticket_id: this.ticketSelecionado.id,
          remetente_id: this.usuarioLogado.id,
          conteudo: this.novaMensagem
        });
        this.mensagens.push({ conteudo: this.novaMensagem, nivel: 'admin', nome_remetente: 'Você' });
        this.novaMensagem = '';
      } catch (err) { alert("Erro ao enviar."); }
    }
  },
  mounted() {
    this.carregarTickets();
    this.carregarPendentes();
  }
};
</script>

<style scoped>
.admin-container { display: flex; height: 100vh; background: #0b0e11; color: white; font-family: sans-serif; }

/* BARRA LATERAL COM CORES DE TESTE */
.sidebar { width: 380px; background: #14171a; border-right: 2px solid #333; padding: 20px; overflow-y: auto; }

.admin-tabs { 
  display: flex; 
  gap: 10px; 
  margin-bottom: 25px; 
  border: 4px solid red; /* SE VOCÊ VER ISSO, O CÓDIGO NOVO SUBIU */
  padding: 5px;
}

.admin-tabs button { 
  flex: 1; 
  padding: 12px; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  background: #0044cc; /* AZUL ROYAL FORTE */
  color: white; 
  font-weight: bold;
}

.admin-tabs button.active { 
  background: #00c896; /* VERDE QUANDO ATIVO */
}

.ticket-card, .pendente-card { 
  background: #1f2327; 
  padding: 15px; 
  margin-bottom: 12px; 
  border-radius: 8px; 
  border-left: 5px solid #00c896;
}

.btn-aprovar { 
  width: 100%; 
  margin-top: 10px; 
  padding: 10px; 
  background: #00c896; 
  color: white; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer; 
}

.badge { background: #ff4d4d; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 5px; }

/* ÁREA DE CHAT */
.chat-area { flex: 1; display: flex; flex-direction: column; background: #0b0e11; }
.chat-header { padding: 20px; border-bottom: 1px solid #333; }
.messages-list { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.msg-bubble { padding: 12px; border-radius: 10px; max-width: 70%; }
.msg-bubble.admin { background: #00c896; align-self: flex-end; }
.msg-bubble.user { background: #333; align-self: flex-start; }

.chat-input { padding: 20px; display: flex; gap: 10px; background: #14171a; }
.chat-input input { flex: 1; padding: 12px; border-radius: 6px; border: 1px solid #333; background: #000; color: white; }
.chat-input button { padding: 0 20px; background: #00c896; color: white; border: none; border-radius: 6px; cursor: pointer; }

.no-selection { flex: 1; display: flex; align-items: center; justify-content: center; color: #666; }
</style>