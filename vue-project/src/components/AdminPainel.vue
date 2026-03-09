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
          v-for="ticket in tickets" 
          :key="ticket.id" 
          @click="selecionarTicket(ticket)"
          :class="['ticket-card', { active: ticketSelecionado?.id === ticket.id }]"
        >
          <p><strong>Projeto:</strong> {{ ticket.empresa }}</p>
          <p><strong>Interessado:</strong> {{ ticket.nome_cliente }}</p>
          <span class="status-badge">{{ ticket.status }}</span>
        </div>
      </div>

      <div v-else class="modificacao-lista">
        <h2>Aguardando Aprovação</h2>
        
        <div v-if="pendentes.projetos.length > 0">
          <h3>Projetos</h3>
          <div v-for="p in pendentes.projetos" :key="p.id" class="pendente-card">
            <p><strong>{{ p.empresa }}</strong></p>
            <p><small>{{ p.nicho }} - R$ {{ p.valor }}</small></p>
            <div class="acoes">
              <button @click="aprovarItem('projeto', p.id)" class="btn-aprovar">Aprovar</button>
              <button @click="reprovarItem('projeto', p.id)" class="btn-reprovar">Excluir</button>
            </div>
          </div>
        </div>

        <div v-if="pendentes.ideias.length > 0" style="margin-top: 20px;">
          <h3>Ideias</h3>
          <div v-for="i in pendentes.ideias" :key="i.id" class="pendente-card ideia">
            <p><strong>{{ i.titulo }}</strong></p>
            <div class="acoes">
              <button @click="aprovarItem('ideia', i.id)" class="btn-aprovar">Aprovar</button>
              <button @click="reprovarItem('ideia', i.id)" class="btn-reprovar">Excluir</button>
            </div>
          </div>
        </div>

        <p v-if="totalPendentes === 0" class="empty-msg">Tudo limpo! Nada pendente.</p>
      </div>
    </aside>

    <main class="chat-area" v-if="ticketSelecionado && abaAtiva === 'tickets'">
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
      <p v-if="abaAtiva === 'tickets'">Selecione uma negociação para começar a mediação.</p>
      <p v-else>Use a aba lateral para analisar e aprovar novos conteúdos.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      abaAtiva: 'tickets', // Controla a visão lateral
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
      return this.pendentes.projetos.length + this.pendentes.ideias.length;
    }
  },
  methods: {
    async carregarTickets() {
      try {
        const res = await axios.get('https://conexo-api.onrender.com/admin/tickets');
        this.tickets = res.data;
      } catch (err) { console.error("Erro ao carregar tickets", err); }
    },
    async carregarPendentes() {
      try {
        const res = await axios.get('https://conexo-api.onrender.com/admin/pendentes');
        this.pendentes = res.data;
      } catch (err) { console.error("Erro ao carregar pendentes", err); }
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
      } catch (err) { alert("Erro ao enviar mensagem."); }
    },
    // NOVOS MÉTODOS DE APROVAÇÃO
    async aprovarItem(tipo, id) {
      try {
        await axios.patch(`https://conexo-api.onrender.com/admin/aprovar/${tipo}/${id}`);
        alert("Aprovado com sucesso!");
        this.carregarPendentes(); // Atualiza a lista
      } catch (err) { alert("Erro ao aprovar."); }
    },
    async reprovarItem(tipo, id) {
      if (!confirm("Deseja realmente excluir/reprovar este item?")) return;
      try {
        const rota = tipo === 'projeto' ? `/projetos/${id}` : `/ideias/${id}`;
        await axios.delete(`https://conexo-api.onrender.com/` + rota);
        this.carregarPendentes();
      } catch (err) { alert("Erro ao excluir."); }
    }
  },
  mounted() {
    this.carregarTickets();
    this.carregarPendentes(); // Carrega o contador inicial de pendentes
  }
};
</script>

<style scoped>
/* Mantendo seus estilos e adicionando os novos */
.admin-container { display: flex; height: 85vh; background: #f4f7f6; }
.sidebar { width: 350px; border-right: 1px solid #ddd; padding: 15px; overflow-y: auto; }
.admin-tabs { display: flex; gap: 5px; margin-bottom: 15px; }
.admin-tabs button { flex: 1; padding: 8px; border: none; cursor: pointer; border-radius: 5px; background: #ddd; }
.admin-tabs button.active { background: #00c896; color: white; }

.ticket-card, .pendente-card { padding: 15px; background: white; margin-bottom: 10px; border-radius: 8px; border-left: 5px solid #00c896; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.pendente-card.ideia { border-left-color: #ffd700; }

.acoes { display: flex; gap: 10px; margin-top: 10px; }
.btn-aprovar { background: #00c896; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.btn-reprovar { background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }

.badge { background: #ff4d4d; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 5px; }
.empty-msg { text-align: center; color: #888; margin-top: 30px; }

/* Restante do seu CSS de chat... */
.chat-area { flex: 1; display: flex; flex-direction: column; padding: 20px; }
.messages-list { flex: 1; overflow-y: auto; padding: 10px; background: white; border-radius: 8px; border: 1px solid #eee; }
.msg-bubble { margin-bottom: 15px; padding: 10px; border-radius: 8px; max-width: 70%; }
.msg-bubble.admin { align-self: flex-end; background: #00c896; color: white; margin-left: auto; }
.msg-bubble.user { background: #eee; }
.chat-input { display: flex; margin-top: 15px; gap: 10px; }
.chat-input input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
.no-selection { flex: 1; display: flex; align-items: center; justify-content: center; color: #888; }
</style>