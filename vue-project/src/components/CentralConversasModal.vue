<template>
  <div class="cx-modal-overlay" @click.self="$emit('fechar')">
    <div class="cx-modal-container">
      
      <!-- HEADER DA CENTRAL DE MENSAGENS -->
      <header class="cx-modal-header">
        <div class="cx-modal-header__info">
          <div class="cx-modal-header__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h2 class="cx-modal-title">Central de Mensagens CoNexo</h2>
            <p class="cx-modal-sub">Gerencie propostas e negociações dos projetos em tempo real</p>
          </div>
        </div>
        <button class="cx-modal-close" @click="$emit('fechar')" aria-label="Fechar">✕</button>
      </header>

      <!-- CORPO DA CENTRAL (SIDEBAR LISTA + ÁREA DE CHAT) -->
      <div class="cx-modal-body" :class="{ 'cx-modal-body--mobile-chat': mobileChatAtivo }">
        
        <!-- SIDEBAR DE CONVERSAS ATIVAS -->
        <aside class="cx-chat-sidebar">
          <div class="cx-sidebar-search">
            <input 
              type="text" 
              v-model="filtroBusca" 
              placeholder="Buscar por projeto ou mensagem..."
              class="cx-search-input"
            />
          </div>

          <div v-if="carregandoConversas" class="cx-sidebar-loading">
            Carregando conversas...
          </div>

          <div v-else-if="conversasFiltradas.length === 0" class="cx-sidebar-empty">
            <p>Nenhuma conversa encontrada.</p>
          </div>

          <div v-else class="cx-conversas-lista">
            <div 
              v-for="c in conversasFiltradas" 
              :key="c.conversa_key || c.projeto_id"
              class="cx-conversa-item"
              :class="{ 'cx-conversa-item--active': conversaSelecionada?.conversa_key ? conversaSelecionada.conversa_key === c.conversa_key : conversaSelecionada?.projeto_id === c.projeto_id }"
              @click="selecionarConversa(c)"
            >
              <div class="cx-conversa-avatar">
                {{ (c.empresa || 'P').charAt(0).toUpperCase() }}
              </div>
              <div class="cx-conversa-info">
                <div class="cx-conversa-top">
                  <h4 class="cx-conversa-titulo">{{ c.empresa }}</h4>
                  <span class="cx-conversa-hora">{{ formatarHora(c.ultima_data) }}</span>
                </div>
                <div class="cx-conversa-sub">
                  <span class="cx-conversa-autor">{{ c.autor_nome }}:</span>
                  <span class="cx-conversa-msg">{{ c.ultima_msg }}</span>
                </div>
                <span v-if="c.nicho" class="cx-conversa-tag">{{ c.nicho }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- ÁREA PRINCIPAL DO CHAT SELECIONADO -->
        <main class="cx-chat-main">
          <template v-if="conversaSelecionada">
            <!-- Header do Chat Ativo -->
            <div class="cx-chat-topbar">
              <button class="cx-chat-back-btn" @click="mobileChatAtivo = false">
                ← Voltar às conversas
              </button>
              <div class="cx-chat-project-details">
                <h3>{{ conversaSelecionada.empresa }}</h3>
                <div class="cx-chat-project-pills">
                  <span v-if="conversaSelecionada.nicho" class="cx-pill">{{ conversaSelecionada.nicho }}</span>
                  <span v-if="conversaSelecionada.valor" class="cx-pill cx-pill--green">
                    R$ {{ Number(conversaSelecionada.valor).toLocaleString('pt-BR') }}
                  </span>
                  <span v-if="conversaSelecionada.porcentagem" class="cx-pill cx-pill--blue">
                    {{ conversaSelecionada.porcentagem }}% Equity
                  </span>
                </div>
              </div>
            </div>

            <!-- Histórico de Mensagens -->
            <div class="cx-messages-history" ref="messagesBoxRef">
              <div v-if="carregandoMensagens" class="cx-messages-loading">
                Carregando histórico...
              </div>

              <div v-else-if="mensagens.length === 0" class="cx-messages-empty">
                Nenhuma mensagem enviada ainda nesta conversa. Digite abaixo para iniciar a negociação!
              </div>

              <template v-else>
                <div 
                  v-for="m in mensagens" 
                  :key="m.id"
                  class="cx-msg-row"
                  :class="ehMensagemMinha(m) ? 'cx-msg-row--mine' : 'cx-msg-row--other'"
                >
                  <div class="cx-msg-bubble">
                    <span class="cx-msg-author">{{ ehMensagemMinha(m) ? 'Você' : (m.remetente_nome || m.remetente || 'Usuário') }}</span>
                    <p class="cx-msg-text">{{ m.mensagem }}</p>
                    <span class="cx-msg-time">{{ formatarHora(m.data_envio || m.created_at) }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- Input de Envio de Mensagem -->
            <form @submit.prevent="enviarNovaMensagem" class="cx-chat-input-bar">
              <input 
                type="text" 
                v-model="novaMensagem" 
                placeholder="Escreva sua mensagem ou proposta..."
                required
                class="cx-chat-input"
                :disabled="enviando"
              />
              <button type="submit" class="cx-chat-send-btn" :disabled="enviando || !novaMensagem.trim()">
                <span v-if="!enviando">Enviar</span>
                <span v-else>Enviando...</span>
              </button>
            </form>
          </template>

          <template v-else>
            <div class="cx-chat-no-selection">
              <div class="cx-no-selection-icon">💬</div>
              <h3>Selecione uma conversa</h3>
              <p>Escolha um projeto na lista ao lado para visualizar as mensagens e responder propostas.</p>
            </div>
          </template>
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import { API_URL } from '../config';

const props = defineProps({
  usuario: { type: Object, default: null },
  projetoInicial: { type: Object, default: null }
});

const emit = defineEmits(['fechar']);

const conversas = ref([]);
const conversaSelecionada = ref(null);
const mensagens = ref([]);
const novaMensagem = ref('');
const filtroBusca = ref('');

const carregandoConversas = ref(false);
const carregandoMensagens = ref(false);
const enviando = ref(false);
const mobileChatAtivo = ref(false);

const messagesBoxRef = ref(null);
let intervalPolling = null;

const conversasFiltradas = computed(() => {
  if (!filtroBusca.value.trim()) return conversas.value;
  const termo = filtroBusca.value.toLowerCase();
  return conversas.value.filter(c => 
    (c.empresa && c.empresa.toLowerCase().includes(termo)) ||
    (c.ultima_msg && c.ultima_msg.toLowerCase().includes(termo)) ||
    (c.nicho && c.nicho.toLowerCase().includes(termo))
  );
});

const formatarHora = (dataStr) => {
  if (!dataStr) return '';
  try {
    const d = new Date(dataStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const ehMensagemMinha = (m) => {
  if (!m) return false;

  // 1. Comparar IDs se disponíveis
  if (props.usuario?.id) {
    if (m.remetente_id && Number(m.remetente_id) === Number(props.usuario.id)) return true;
    if (m.usuario_id && Number(m.usuario_id) === Number(props.usuario.id)) return true;
  }

  // 2. Comparar nomes
  const meunome = (props.usuario?.nome || '').trim().toLowerCase();
  const nomeRemetente = (m.remetente_nome || m.remetente || m.autor_nome || '').trim().toLowerCase();

  if (meunome && nomeRemetente) {
    if (meunome === nomeRemetente) return true;
    if (meunome.split(' ')[0] === nomeRemetente.split(' ')[0]) return true;
  }

  return false;
};

const carregarConversas = async () => {
  carregandoConversas.value = true;
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    let res;
    try {
      res = await axios.get(`${API_URL}/minhas-conversas`, { headers });
    } catch {
      res = await axios.get(`${API_URL}/conversas`, { headers });
    }
    
    if (res.data && Array.isArray(res.data)) {
      conversas.value = res.data;
      
      // Se tiver projeto inicial vindo das props e ainda não tiver selecionado
      if (props.projetoInicial && !conversaSelecionada.value) {
        const encontrada = conversas.value.find(c => c.projeto_id === props.projetoInicial.id);
        if (encontrada) {
          selecionarConversa(encontrada);
        } else {
          // Cria conversa temporária 1-para-1 para o projeto inicial
          const novaConversa = {
            conversa_key: `${props.projetoInicial.id}_novo`,
            projeto_id: props.projetoInicial.id,
            empresa: props.projetoInicial.empresa,
            nicho: props.projetoInicial.nicho,
            valor: props.projetoInicial.valor,
            porcentagem: props.projetoInicial.porcentagem,
            dono_id: props.projetoInicial.usuario_id || 0,
            investidor_id: props.usuario?.id || 0,
            investidor_nome: props.usuario?.nome || 'Usuário',
            ultima_msg: 'Inicie a conversa...',
            autor_nome: props.usuario?.nome || 'Usuário',
            ultima_data: new Date().toISOString()
          };
          conversas.value.unshift(novaConversa);
          selecionarConversa(novaConversa);
        }
      } else if (conversas.value.length > 0 && !conversaSelecionada.value) {
        if (window.innerWidth > 768) {
          selecionarConversa(conversas.value[0]);
        }
      }
    }
  } catch (err) {
    console.error("Erro ao carregar lista de conversas:", err);
  } finally {
    carregandoConversas.value = false;
  }
};

const selecionarConversa = async (conversa) => {
  conversaSelecionada.value = conversa;
  mobileChatAtivo.value = true;
  await carregarMensagens(conversa);
};

const carregarMensagens = async (conversa) => {
  if (!conversa || !conversa.projeto_id) return;
  carregandoMensagens.value = true;
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    let url = `${API_URL}/mensagens/${conversa.projeto_id}`;
    const params = [];
    const invId = conversa.investidor_id || conversa.participante_id || 0;
    const invNome = conversa.investidor_nome || conversa.participante_nome || '';

    if (invId > 0) {
      params.push(`investidor_id=${invId}`);
      params.push(`participante_id=${invId}`);
    }
    if (invNome) {
      params.push(`investidor_nome=${encodeURIComponent(invNome)}`);
      params.push(`participante_nome=${encodeURIComponent(invNome)}`);
      params.push(`remetente=${encodeURIComponent(invNome)}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const res = await axios.get(url, { headers });
    mensagens.value = Array.isArray(res.data) ? res.data : [];
    
    await nextTick();
    scrollParaFim();
  } catch (err) {
    console.error("Erro ao carregar mensagens:", err);
  } finally {
    carregandoMensagens.value = false;
  }
};

const scrollParaFim = () => {
  if (messagesBoxRef.value) {
    messagesBoxRef.value.scrollTop = messagesBoxRef.value.scrollHeight;
  }
};

const enviarNovaMensagem = async () => {
  if (!conversaSelecionada.value || !novaMensagem.value.trim()) return;
  
  enviando.value = true;
  const texto = novaMensagem.value.trim();
  const conv = conversaSelecionada.value;
  const nomeUsuario = props.usuario?.nome || 'Usuário';

  const me = props.usuario?.id ? Number(props.usuario.id) : 0;
  const ehDono = me > 0 && conv.dono_id > 0 && me === conv.dono_id;
  const destinatarioId = ehDono ? (conv.investidor_id || 0) : (conv.dono_id || 0);
  const destinatarioNome = ehDono ? (conv.investidor_nome || '') : '';

  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    await axios.post(`${API_URL}/mensagens`, {
      projeto_id: conv.projeto_id,
      destinatario_id: destinatarioId,
      destinatario: destinatarioNome,
      remetente: nomeUsuario,
      mensagem: texto
    }, { headers });

    novaMensagem.value = '';
    
    await carregarMensagens(conv);
    conv.ultima_msg = texto;
    conv.autor_nome = nomeUsuario;
    conv.ultima_data = new Date().toISOString();
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    alert("Erro ao enviar mensagem. Tente novamente.");
  } finally {
    enviando.value = false;
  }
};

onMounted(() => {
  carregarConversas();
  intervalPolling = setInterval(() => {
    if (conversaSelecionada.value) {
      carregarMensagens(conversaSelecionada.value);
    }
  }, 3000);
});

onUnmounted(() => {
  if (intervalPolling) clearInterval(intervalPolling);
});
</script>

<style scoped>
/* ─── OVERLAY E MODAL CONTAINER ─────────────────────────────────────────────── */
.cx-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(8, 12, 18, 0.85);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cx-modal-container {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 1050px;
  height: 85vh;
  max-height: 750px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  color: #e2e8f0;
}

/* ─── HEADER ────────────────────────────────────────────────────────────────── */
.cx-modal-header {
  padding: 16px 24px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cx-modal-header__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cx-modal-header__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cx-modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.cx-modal-sub {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 2px 0 0 0;
}

.cx-modal-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: 0.2s;
}

.cx-modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* ─── CORPO ─────────────────────────────────────────────────────────────────── */
.cx-modal-body {
  flex: 1;
  display: grid;
  grid-template-columns: 340px 1fr;
  overflow: hidden;
}

/* ─── SIDEBAR LISTA DE CONVERSAS ────────────────────────────────────────────── */
.cx-chat-sidebar {
  background: #0f172a;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cx-sidebar-search {
  padding: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.cx-search-input {
  width: 100%;
  padding: 10px 14px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.88rem;
  outline: none;
}

.cx-search-input:focus {
  border-color: #10b981;
}

.cx-conversas-lista {
  flex: 1;
  overflow-y: auto;
}

.cx-conversa-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.2s;
}

.cx-conversa-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.cx-conversa-item--active {
  background: rgba(16, 185, 129, 0.12) !important;
  border-left: 3px solid #10b981;
}

.cx-conversa-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cx-conversa-info {
  flex: 1;
  min-width: 0;
}

.cx-conversa-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.cx-conversa-titulo {
  font-size: 0.92rem;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.cx-conversa-hora {
  font-size: 0.72rem;
  color: #64748b;
  flex-shrink: 0;
}

.cx-conversa-sub {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  gap: 4px;
}

.cx-conversa-autor {
  font-weight: 600;
  color: #cbd5e1;
}

.cx-conversa-tag {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.7rem;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  padding: 2px 6px;
  border-radius: 4px;
}

.cx-sidebar-loading, .cx-sidebar-empty {
  padding: 30px 15px;
  text-align: center;
  color: #64748b;
  font-size: 0.88rem;
}

/* ─── ÁREA PRINCIPAL DO CHAT ────────────────────────────────────────────────── */
.cx-chat-main {
  display: flex;
  flex-direction: column;
  background: #090d16;
  overflow: hidden;
}

.cx-chat-topbar {
  padding: 14px 20px;
  background: #111827;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cx-chat-back-btn {
  display: none;
  background: none;
  border: none;
  color: #10b981;
  font-weight: 600;
  cursor: pointer;
}

.cx-chat-project-details h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.cx-chat-project-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cx-pill {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.cx-pill--green {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.cx-pill--blue {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

/* ─── HISTÓRICO DE MENSAGENS ────────────────────────────────────────────────── */
.cx-messages-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cx-messages-loading, .cx-messages-empty {
  text-align: center;
  color: #64748b;
  margin: auto 0;
  font-size: 0.9rem;
}

.cx-msg-row {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.cx-msg-row--mine {
  align-items: flex-end;
}

.cx-msg-row--other {
  align-items: flex-start;
}

.cx-msg-bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Mensagens Enviadas pelo Usuário Logado (Direita - Esmeralda/WhatsApp) */
.cx-msg-row--mine .cx-msg-bubble {
  background: linear-gradient(135deg, #0d9c6e, #057a54);
  color: #ffffff;
  border-bottom-right-radius: 2px;
  border: none;
}

/* Mensagens Recebidas de Outros Usuários (Esquerda - Escuro) */
.cx-msg-row--other .cx-msg-bubble {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 2px;
}

.cx-msg-author {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.cx-msg-row--mine .cx-msg-author {
  color: #a7f3d0;
  text-align: right;
}

.cx-msg-row--other .cx-msg-author {
  color: #60a5fa;
  text-align: left;
}

.cx-msg-text {
  font-size: 0.92rem;
  line-height: 1.45;
  margin: 0 0 4px 0;
  word-break: break-word;
  white-space: pre-wrap;
}

.cx-msg-time {
  display: block;
  font-size: 0.68rem;
  opacity: 0.75;
  text-align: right;
}

/* ─── INPUT BAR ─────────────────────────────────────────────────────────────── */
.cx-chat-input-bar {
  padding: 14px 20px;
  background: #111827;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 10px;
}

.cx-chat-input {
  flex: 1;
  padding: 12px 16px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 0.92rem;
  outline: none;
}

.cx-chat-input:focus {
  border-color: #10b981;
}

.cx-chat-send-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0 22px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
}

.cx-chat-send-btn:hover:not(:disabled) {
  background: #059669;
}

.cx-chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cx-chat-no-selection {
  margin: auto;
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.cx-no-selection-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

/* ─── RESPONSIVIDADE MOBILE ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .cx-modal-overlay {
    padding: 0;
  }

  .cx-modal-container {
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    border: none;
  }

  .cx-modal-header {
    padding: 12px 16px;
  }

  .cx-modal-sub {
    display: none;
  }

  .cx-modal-title {
    font-size: 1rem;
  }

  .cx-modal-body {
    grid-template-columns: 1fr;
  }

  .cx-chat-main {
    display: none;
  }

  .cx-modal-body--mobile-chat .cx-chat-sidebar {
    display: none;
  }

  .cx-modal-body--mobile-chat .cx-chat-main {
    display: flex;
    height: 100%;
  }

  .cx-chat-topbar {
    padding: 10px 14px;
  }

  .cx-chat-back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.82rem;
  }

  .cx-messages-history {
    padding: 12px;
  }

  .cx-msg-bubble {
    max-width: 88%;
  }

  .cx-chat-input-bar {
    padding: 10px 12px;
  }

  .cx-chat-input {
    font-size: 0.95rem;
    padding: 12px;
  }

  .cx-chat-send-btn {
    padding: 0 16px;
    font-size: 0.88rem;
  }
}
</style>
