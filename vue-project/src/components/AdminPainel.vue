<template>
  <div class="admin-container">
    <aside class="sidebar">
      <div class="logo-area">
        <h1 class="logo-text">CoNexo <span>Admin</span></h1>
      </div>

      <div class="admin-tabs">
        <button 
          :class="{ active: abaAtiva === 'tickets' }" 
          @click="abaAtiva = 'tickets'"
        >
          📂 Negociações
        </button>
        <button 
          :class="{ active: abaAtiva === 'pendentes' }" 
          @click="abaAtiva = 'pendentes'; carregarPendentes()"
        >
          ⏳ Pendentes <span v-if="totalPendentes > 0" class="badge">{{ totalPendentes }}</span>
        </button>
      </div>

      <hr class="divider" />

      <div v-if="abaAtiva === 'tickets'" class="list-section">
        <h2 class="section-title">Negociações Ativas</h2>
        <div 
          v-for="ticket in tickets" :key="ticket.id" 
          @click="selecionarTicket(ticket)"
          :class="['card-item', { active: ticketSelecionado?.id === ticket.id }]"
        >
          <p class="card-empresa">{{ ticket.empresa }}</p>
          <p class="card-user">Interessado: {{ ticket.nome_cliente }}</p>
        </div>
        <p v-if="tickets.length === 0" class="empty-msg">Nenhuma negociação encontrada.</p>
      </div>

      <div v-else class="list-section">
        <h2 class="section-title">Aguardando Aprovação</h2>
        
        <div v-if="pendentes.projetos.length > 0">
          <h3 class="sub-title">Projetos</h3>
          <div v-for="p in pendentes.projetos" :key="p.id" class="pendente-card">
            <p><strong>{{ p.empresa }}</strong></p>
            <button @click="aprovarItem('projeto', p.id)" class="btn-aprovar">✅ Aprovar Projeto</button>
          </div>
        </div>

        <div v-if="pendentes.ideias.length > 0" class="mt-20">
          <h3 class="sub-title">Ideias</h3>
          <div v-for="i in pendentes.ideias" :key="i.id" class="pendente-card ideia">
            <p><strong>{{ i.titulo }}</strong></p>
            <button @click="aprovarItem('ideia', i.id)" class="btn-aprovar">✅ Aprovar Ideia</button>
          </div>
        </div>

        <p v-if="totalPendentes === 0" class="empty-msg">Nenhum item pendente no momento.</p>
      </div>
    </aside>

    <main class="chat-area">
      <div v-if="ticketSelecionado && abaAtiva === 'tickets'" class="chat-wrapper">
        <header class="chat-header">
          <h3>Chat de Mediação: {{ ticketSelecionado.empresa }}</h3>
          <span>Envolvidos: Admin, Proprietário e {{ ticketSelecionado.nome_cliente }}</span>
        </header>
        
        <div class="messages-list" ref="scrollContainer">
          <div v-for="msg in mensagens" :key="msg.id" :class="['msg-bubble', msg.nivel]">
            <small>{{ msg.nome_remetente }}</small>
            <p>{{ msg.conteudo }}</p>
          </div>
        </div>

        <div class="chat-input">
          <input 
            v-model="novaMensagem" 
            @keyup.enter="enviarMensagem" 
            placeholder="Digite sua mensagem de mediação..." 
          />
          <button @click="enviarMensagem">Enviar</button>
        </div>
      </div>
      
      <div v-else class="no-selection">
        <div class="placeholder-content">
          <p>Selecione uma negociação à esquerda para ver o histórico de mensagens ou gerencie os itens pendentes.</p>
        </div>
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
  computed: {
    totalPendentes() {
      return (this.pendentes.projetos?.length || 0) + (this.pendentes.ideias?.length || 0);
    }
  },
  methods: {
    async carregarTickets() {
      try {
        const res = await axios.get(`${API}/admin/tickets`);
        this.tickets = res.data;
      } catch (err) { console.error("Erro ao carregar tickets:", err); }
    },
    async carregarPendentes() {
      try {
        const res = await axios.get(`${API}/admin/pendentes`);
        this.pendentes = res.data;
      } catch (err) { console.error("Erro ao carregar pendentes:", err); }
    },
    async selecionarTicket(t) {
      this.ticketSelecionado = t;
      try {
        const res = await axios.get(`${API}/tickets/${t.id}/mensagens`);
        this.mensagens = res.data;
        this.$nextTick(() => this.scrollToBottom());
      } catch (err) { console.error(err); }
    },
    async aprovarItem(tipo, id) {
      try {
        await axios.patch(`${API}/admin/aprovar/${tipo}/${id}`);
        alert("Item aprovado com sucesso!");
        this.carregarPendentes();
      } catch (err) { alert("Erro ao aprovar item."); }
    },
    async enviarMensagem() {
      if (!this.novaMensagem.trim()) return;
      try {
        const payload = {
          ticket_id: this.ticketSelecionado.id,
          remetente_id: this.usuarioLogado.id,
          conteudo: this.novaMensagem
        };
        await axios.post(`${API}/mensagens`, payload);
        this.mensagens.push({ 
          conteudo: this.novaMensagem, 
          nivel: 'admin', 
          nome_remetente: 'Você (Admin)' 
        });
        this.novaMensagem = '';
        this.$nextTick(() => this.scrollToBottom());
      } catch (err) { alert("Erro ao enviar mensagem."); }
    },
    scrollToBottom() {
      const container = this.$refs.scrollContainer;
      if (container) container.scrollTop = container.scrollHeight;
    }
  },
  mounted() {
    this.carregarTickets();
    this.carregarPendentes();
  }
};
</script>

<style scoped>
.admin-container { 
  display: flex; 
  height: 100vh; 
  background: #0b0e11; 
  color: white;
}

.sidebar { 
  width: 350px; 
  background: #14171a; 
  border-right: 1px solid #333; 
  display: flex; 
  flex-direction: column; 
  padding: 20px;
}

.logo-text { font-size: 24px; font-weight: bold; color: #00c896; margin-bottom: 5px; }
.logo-text span { color: #fff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }

.admin-tabs { display: flex; gap: 8px; margin: 20px 0; }
.admin-tabs button { 
  flex: 1; padding: 12px; border: none; border-radius: 6px; cursor: pointer; 
  background: #262c31; color: #888; font-weight: bold; transition: 0.3s;
}
.admin-tabs button.active { background: #00c896; color: #000; }

.card-item, .pendente-card {
  background: #1f2327; padding: 15px; border-radius: 8px; margin-bottom: 10px;
  cursor: pointer; border-left: 4px solid #333; transition: 0.2s;
}
.card-item:hover { background: #262c31; }
.card-item.active { border-left-color: #00c896; background: #262c31; }

.btn-aprovar {
  margin-top: 10px; width: 100%; padding: 8px; background: #00c896;
  color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;
}

.badge { background: #ff4d4d; padding: 2px 6px; border-radius: 8px; font-size: 11px; margin-left: 5px; }

.chat-area { flex: 1; display: flex; flex-direction: column; }
.chat-wrapper { display: flex; flex-direction: column; height: 100%; }
.chat-header { padding: 20px; background: #14171a; border-bottom: 1px solid #333; }

.messages-list { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
.msg-bubble { padding: 12px 16px; border-radius: 12px; max-width: 75%; }
.msg-bubble.admin { align-self: flex-end; background: #00c896; color: #000; }
.msg-bubble.user { align-self: flex-start; background: #333; color: #fff; }

.chat-input { padding: 20px; display: flex; gap: 10px; background: #14171a; }
.chat-input input { flex: 1; background: #000; border: 1px solid #333; padding: 12px; border-radius: 6px; color: white; }
.chat-input button { background: #00c896; border: none; padding: 0 25px; border-radius: 6px; font-weight: bold; cursor: pointer; }

.no-selection { height: 100%; display: flex; align-items: center; justify-content: center; color: #555; text-align: center; padding: 40px; }
.mt-20 { margin-top: 20px; }
.divider { border: 0; border-top: 1px solid #333; margin: 10px 0; }
</style>