<template>
  <div class="page-shell">
    <div class="page-inner">

      <!-- Cabeçalho da página -->
      <div class="page-header">
        <h1 class="page-header__title">Projetos</h1>
        <p class="page-header__sub">Publique seu negócio e conecte-se a investidores na plataforma.</p>
      </div>

      <div class="page-layout">

        <!-- Formulário lateral -->
        <aside class="page-form-col">
          <div class="cx-card">
            <h2 class="cx-card__title">Anunciar projeto</h2>
            <p class="cx-card__sub">Preencha os dados do seu negócio. Após envio, passará por revisão.</p>

            <form @submit.prevent="enviarProjeto" class="cx-form" novalidate>
              <div class="cx-field">
                <label for="proj-empresa">Nome da empresa</label>
                <input id="proj-empresa" v-model="novo.empresa" type="text" placeholder="Ex: HealthTech Ltda." required />
              </div>

              <div class="cx-field-row">
                <div class="cx-field">
                  <label for="proj-uf">UF</label>
                  <select id="proj-uf" v-model="novo.estado" @change="carregarCidadesPorUF" required>
                    <option value="" disabled selected>UF</option>
                    <option v-for="uf in estadosBR" :key="uf.sigla" :value="uf.sigla">
                      {{ uf.sigla }}
                    </option>
                  </select>
                </div>
                <div class="cx-field cx-field--grow">
                  <label for="proj-cidade">Cidade</label>
                  <select id="proj-cidade" v-model="novo.cidade" :disabled="!novo.estado || carregandoCidades" required>
                    <option value="" disabled selected>
                      {{ carregandoCidades ? 'Carregando cidades...' : (!novo.estado ? 'Selecione o estado primeiro' : 'Selecione a cidade') }}
                    </option>
                    <option v-for="cid in cidades" :key="cid" :value="cid">
                      {{ cid }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="cx-field">
                <label for="proj-nicho">Nicho de atuação</label>
                <select id="proj-nicho" v-model="novo.nicho" required>
                  <option value="" disabled selected>Selecione o nicho</option>
                  <option v-for="nicho in nichosMercado" :key="nicho" :value="nicho">
                    {{ nicho }}
                  </option>
                </select>
              </div>

              <!-- SELETOR DE IMAGEM OTIMIZADO -->
              <div class="cx-field">
                <label for="proj-file">Foto / Logótipo do Local (Anexo)</label>
                <input 
                  id="proj-file" 
                  type="file" 
                  accept="image/*" 
                  @change="selecionarImagemDocumento" 
                  class="cx-file-input" 
                />
                
                <div v-if="novo.imagem_url" class="cx-img-preview">
                  <img :src="novo.imagem_url" alt="Pré-visualização" />
                  <button type="button" @click="removerImagemAnexada" class="cx-btn-remove-img">✕ Remover Imagem</button>
                </div>
              </div>

              <div class="cx-field">
                <label for="proj-desc">Descrição do projeto</label>
                <textarea id="proj-desc" v-model="novo.descricao" placeholder="Descreva o que sua empresa faz e qual a oportunidade de investimento..." required rows="4"></textarea>
              </div>

              <div class="cx-field-row cx-field-row--equal">
                <div class="cx-field">
                  <label for="proj-valor">Captação (R$)</label>
                  <input id="proj-valor" v-model="novo.valor" type="number" placeholder="0" min="0" required />
                </div>
                <div class="cx-field">
                  <label for="proj-equity">Equity (%)</label>
                  <input id="proj-equity" v-model="novo.porcentagem" type="number" placeholder="0" min="0" max="100" required />
                </div>
              </div>

              <div class="cx-divider">
                <span>Contato para investidores</span>
              </div>

              <div class="cx-field">
                <label for="proj-email">E-mail de contato</label>
                <input id="proj-email" v-model="novo.email_contato" type="email" placeholder="contato@empresa.com" />
              </div>

              <div class="cx-field">
                <label for="proj-tel">WhatsApp / Telefone</label>
                <input id="proj-tel" v-model="novo.telefone" type="text" placeholder="+55 11 90000-0000" />
              </div>

              <button type="submit" class="cx-submit">Publicar projeto</button>
            </form>
          </div>
        </aside>

        <!-- Lista de projetos -->
        <section class="page-list-col" aria-labelledby="list-title">
          <h2 id="list-title" class="page-list-title">Projetos publicados</h2>

          <!-- BARRA DE FILTROS DE PROJETOS -->
          <div class="filter-bar">
            <div class="filter-group">
              <!-- Filtro UF -->
              <div class="filter-item">
                <label for="filter-uf">Estado</label>
                <select id="filter-uf" v-model="filtroUF" @change="carregarCidadesFiltroUF">
                  <option value="">Todos os Estados</option>
                  <option v-for="uf in estadosBR" :key="uf.sigla" :value="uf.sigla">
                    {{ uf.nome }} ({{ uf.sigla }})
                  </option>
                </select>
              </div>

              <!-- Filtro Cidade -->
              <div class="filter-item">
                <label for="filter-cidade">Cidade</label>
                <select id="filter-cidade" v-model="filtroCidade" :disabled="!filtroUF || carregandoCidadesFiltro">
                  <option value="">Todas as Cidades</option>
                  <option v-for="cid in cidadesFiltro" :key="cid" :value="cid">
                    {{ cid }}
                  </option>
                </select>
              </div>

              <!-- Filtro Nicho -->
              <div class="filter-item">
                <label for="filter-nicho">Nicho</label>
                <select id="filter-nicho" v-model="filtroNicho">
                  <option value="">Todos os Nichos</option>
                  <option v-for="nicho in nichosMercado" :key="nicho" :value="nicho">
                    {{ nicho }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Botão de Limpar Filtros -->
            <button 
              v-if="filtroUF || filtroCidade || filtroNicho" 
              @click="limparFiltros" 
              class="filter-reset-btn"
              title="Limpar filtros"
            >
              ✕ Limpar Filtros
            </button>
          </div>

          <div v-if="projetosFiltrados.length === 0" class="cx-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p v-if="filtroUF || filtroCidade || filtroNicho">Nenhum projeto encontrado para os filtros selecionados.</p>
            <p v-else>Nenhum projeto publicado ainda. Seja o primeiro.</p>
          </div>

          <div class="project-list" v-else>
            <article class="project-item" v-for="p in projetosFiltrados" :key="p.id">
              
              <div v-if="p.imagem_url" class="project-item__img-container">
                <img :src="p.imagem_url" :alt="p.empresa" class="project-item__img" />
              </div>

              <header class="project-item__head">
                <span class="project-item__badge">{{ p.nicho }}</span>
                <span class="project-item__loc">{{ p.cidade }}, {{ p.estado }}</span>
              </header>

              <h3 class="project-item__title">{{ p.empresa }}</h3>
              <p class="project-item__desc">{{ p.descricao }}</p>

              <footer class="project-item__foot">
                <div class="project-item__financials">
                  <div class="project-item__fin-item">
                    <span>Captação</span>
                    <strong>R$ {{ Number(p.valor).toLocaleString('pt-BR') }}</strong>
                  </div>
                  <div class="project-item__fin-divider" aria-hidden="true"></div>
                  <div class="project-item__fin-item">
                    <span>Equity</span>
                    <strong>{{ p.porcentagem }}%</strong>
                  </div>
                </div>

                <div class="project-item__actions">
                  <button class="cx-btn-action" @click="abrirChat(p)">💬 Negociar / Chat</button>
                  <button
                    v-if="user?.nivel === 'admin'"
                    class="cx-btn-action cx-btn-action--danger"
                    @click="$emit('excluir', p.id)"
                  >Excluir</button>
                </div>
              </footer>
            </article>
          </div>
        </section>

      </div>
    </div>

    <!-- MODAL DE CHAT INTERNO -->
    <div v-if="chatAtivo" class="chat-modal-overlay" @click.self="fecharChat">
      <div class="chat-modal">
        <header class="chat-header">
          <div>
            <h3>Negociação: {{ projetoSelecionado.empresa }}</h3>
            <span class="chat-sub">Converse diretamente com o responsável pelo projeto</span>
          </div>
          <button class="chat-close" @click="fecharChat">✕</button>
        </header>

        <div class="chat-body" ref="chatBodyRef">
          <div v-if="mensagens.length === 0" class="chat-empty">
            Nenhuma mensagem ainda. Inicie a conversa enviando uma proposta ou dúvida!
          </div>
          <div 
            v-for="m in mensagens" 
            :key="m.id" 
            class="chat-bubble"
            :class="{ 'chat-bubble--mine': m.remetente_id === user?.id }"
          >
            <span class="bubble-autor">{{ m.remetente_nome }}</span>
            <p>{{ m.mensagem }}</p>
            <span class="bubble-time">{{ new Date(m.data_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>
        </div>

        <form @submit.prevent="enviarMensagem" class="chat-footer">
          <input 
            type="text" 
            v-model="novaMensagem" 
            placeholder="Digite sua mensagem ou proposta..." 
            required 
          />
          <button type="submit" class="cx-btn-primary">Enviar</button>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import axios from 'axios';
import { API_URL } from '../config';

const props = defineProps(['projetos', 'user']);
const emit = defineEmits(['salvar', 'excluir']);

const novo = ref({
  empresa: '',
  estado: '',
  cidade: '',
  nicho: '',
  imagem_url: '',
  descricao: '',
  valor: '',
  porcentagem: '',
  email_contato: '',
  telefone: ''
});

const estadosBR = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const nichosMercado = [
  'Tecnologia',
  'Saúde',
  'Varejo',
  'Agronegócio',
  'Educação',
  'Indústria',
  'Finanças',
  'Logística',
  'Alimentação',
  'Serviços',
  'Outros'
];

const cidades = ref([]);
const carregandoCidades = ref(false);

const carregarCidadesPorUF = async () => {
  novo.value.cidade = '';
  cidades.value = [];

  if (!novo.value.estado) return;

  carregandoCidades.value = true;
  try {
    const res = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${novo.value.estado}/municipios?orderBy=nome`
    );
    cidades.value = res.data.map(c => c.nome);
  } catch (err) {
    console.error("Erro ao carregar cidades da API do IBGE:", err);
  } finally {
    carregandoCidades.value = false;
  }
};

// Estados e lógica dos Filtros de Projetos
const filtroUF = ref('');
const filtroCidade = ref('');
const filtroNicho = ref('');
const cidadesFiltro = ref([]);
const carregandoCidadesFiltro = ref(false);

const carregarCidadesFiltroUF = async () => {
  filtroCidade.value = '';
  cidadesFiltro.value = [];

  if (!filtroUF.value) return;

  carregandoCidadesFiltro.value = true;
  try {
    const res = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filtroUF.value}/municipios?orderBy=nome`
    );
    cidadesFiltro.value = res.data.map(c => c.nome);
  } catch (err) {
    console.error("Erro ao carregar cidades do filtro IBGE:", err);
  } finally {
    carregandoCidadesFiltro.value = false;
  }
};

const limparFiltros = () => {
  filtroUF.value = '';
  filtroCidade.value = '';
  filtroNicho.value = '';
  cidadesFiltro.value = [];
};

const projetosFiltrados = computed(() => {
  if (!props.projetos) return [];
  return props.projetos.filter(p => {
    const matchUF = !filtroUF.value || (p.estado && p.estado.toUpperCase() === filtroUF.value.toUpperCase());
    const matchCidade = !filtroCidade.value || (p.cidade && p.cidade.toLowerCase() === filtroCidade.value.toLowerCase());
    const matchNicho = !filtroNicho.value || (p.nicho && p.nicho.toLowerCase() === filtroNicho.value.toLowerCase());

    return matchUF && matchCidade && matchNicho;
  });
});

// Estados do Chat
const chatAtivo = ref(false);
const projetoSelecionado = ref(null);
const mensagens = ref([]);
const novaMensagem = ref('');
const chatBodyRef = ref(null);

// Função de redimensionamento e compressão inteligente via Canvas
const selecionarImagemDocumento = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert("Por favor, selecione um arquivo de imagem válido.");
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const MAX_SIZE = 800;
      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compacta para JPEG com qualidade 0.7 para garantir envio perfeito
      novo.value.imagem_url = canvas.toDataURL('image/jpeg', 0.7);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removerImagemAnexada = () => {
  novo.value.imagem_url = '';
  const fileInput = document.getElementById('proj-file');
  if (fileInput) fileInput.value = '';
};

const enviarProjeto = () => {
  const projetoFinal = {
    ...novo.value,
    usuario_id: props.user?.id,
    status: 'pendente'
  };
  emit('salvar', projetoFinal);
  Object.keys(novo.value).forEach(key => novo.value[key] = '');
  cidades.value = [];
  removerImagemAnexada();
  alert("Projeto enviado com sucesso! Ele aparecerá na lista assim que o administrador aprová-lo.");
};

// Funções de Chat
const abrirChat = async (projeto) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Você estar conectado para conversar com o autor do projeto.");
    return;
  }

  projetoSelecionado.value = projeto;
  chatAtivo.value = true;
  await carregarMensagens(projeto.id);
};

const carregarMensagens = async (projetoId) => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get(`${API_URL}/mensagens/${projetoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    mensagens.value = res.data;
    scrollToBottom();
  } catch (err) {
    console.error("Erro ao carregar mensagens:", err);
  }
};

const enviarMensagem = async () => {
  if (!novaMensagem.value.trim() || !projetoSelecionado.value) return;

  const token = localStorage.getItem('token');
  try {
    await axios.post(
      `${API_URL}/mensagens`,
      {
        projeto_id: projetoSelecionado.value.id,
        destinatario_id: projetoSelecionado.value.usuario_id || 1,
        mensagem: novaMensagem.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    novaMensagem.value = '';
    await carregarMensagens(projetoSelecionado.value.id);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    alert("Erro ao enviar mensagem. Tente novamente.");
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
    }
  });
};

const fecharChat = () => {
  chatAtivo.value = false;
  projetoSelecionado.value = null;
  mensagens.value = [];
};
</script>

<style scoped>
.page-shell { background: var(--cx-bg); min-height: calc(100vh - var(--cx-navbar-h)); }
.page-inner { max-width: var(--cx-container); margin: 0 auto; padding: var(--cx-space-12) var(--cx-space-8); }
.page-header { margin-bottom: var(--cx-space-10); border-bottom: 1px solid var(--cx-border-soft); padding-bottom: var(--cx-space-6); }
.page-header__title { font-size: var(--cx-text-3xl); font-weight: 800; color: var(--cx-text); letter-spacing: -0.03em; margin-bottom: var(--cx-space-2); }
.page-header__sub { font-size: var(--cx-text-base); color: var(--cx-text-muted); }
.page-layout { display: flex; gap: var(--cx-space-20); align-items: flex-start; }
.page-form-col { flex: 0 0 380px; position: sticky; top: calc(var(--cx-navbar-h) + var(--cx-space-6)); }
.page-list-col { flex: 1; min-width: 0; }
.cx-card { background: var(--cx-surface); border: 1px solid var(--cx-border); border-radius: var(--cx-radius-xl); padding: var(--cx-space-8); }
.cx-card__title { font-size: var(--cx-text-xl); font-weight: 700; color: var(--cx-text); margin-bottom: var(--cx-space-2); }
.cx-card__sub { font-size: var(--cx-text-sm); color: var(--cx-text-muted); margin-bottom: var(--cx-space-6); line-height: 1.6; }
.cx-form { display: flex; flex-direction: column; gap: var(--cx-space-4); }
.cx-field { display: flex; flex-direction: column; gap: var(--cx-space-2); }
.cx-field--grow { flex: 1; }
.cx-field label { font-size: var(--cx-text-xs); font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--cx-text-2); }
.cx-field input, .cx-field textarea, .cx-field select { width: 100%; padding: 10px 12px; border: 1px solid var(--cx-border); border-radius: var(--cx-radius-md); font-size: var(--cx-text-sm); font-family: var(--cx-font-sans); color: var(--cx-text); background: var(--cx-bg); box-sizing: border-box; }
.cx-file-input { padding: 8px !important; font-size: var(--cx-text-xs) !important; cursor: pointer; }
.cx-img-preview { margin-top: 8px; position: relative; border-radius: 6px; overflow: hidden; border: 1px solid var(--cx-border); }
.cx-img-preview img { width: 100%; height: 130px; object-fit: cover; display: block; }
.cx-btn-remove-img { width: 100%; background: #fef2f2; color: #b91c1c; border: none; padding: 6px; font-size: var(--cx-text-xs); font-weight: 600; cursor: pointer; }
.cx-field textarea { resize: vertical; min-height: 96px; }
.cx-field-row { display: grid; grid-template-columns: 80px 1fr; gap: var(--cx-space-3); }
.cx-field-row--equal { grid-template-columns: 1fr 1fr; }
.cx-divider { display: flex; align-items: center; gap: var(--cx-space-3); margin: var(--cx-space-2) 0; }
.cx-divider span { font-size: var(--cx-text-xs); font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--cx-text-faint); white-space: nowrap; }
.cx-divider::before, .cx-divider::after { content: ''; flex: 1; height: 1px; background: var(--cx-border-soft); }
.cx-submit { width: 100%; padding: 11px; background: var(--cx-primary); color: #fff; border: none; border-radius: var(--cx-radius-md); font-size: var(--cx-text-sm); font-weight: 600; font-family: var(--cx-font-sans); cursor: pointer; margin-top: var(--cx-space-2); }
.cx-submit:hover { background: var(--cx-primary-dark); }

.page-list-title { font-size: var(--cx-text-xl); font-weight: 700; color: var(--cx-text); margin-bottom: var(--cx-space-6); }
.project-list { display: flex; flex-direction: column; gap: var(--cx-space-4); }
.project-item { background: var(--cx-surface); border: 1px solid var(--cx-border); border-radius: var(--cx-radius-xl); padding: var(--cx-space-6); overflow: hidden; }
.project-item__img-container { width: calc(100% + var(--cx-space-12)); margin: calc(-1 * var(--cx-space-6)) calc(-1 * var(--cx-space-6)) var(--cx-space-4) calc(-1 * var(--cx-space-6)); max-height: 220px; overflow: hidden; background: var(--cx-bg-alt); }
.project-item__img { width: 100%; height: 220px; object-fit: cover; display: block; }
.project-item__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--cx-space-4); }
.project-item__badge { font-size: var(--cx-text-xs); font-weight: 700; text-transform: uppercase; color: var(--cx-primary); background: var(--cx-primary-light); padding: 3px 10px; border-radius: var(--cx-radius-full); }
.project-item__loc { font-size: var(--cx-text-xs); color: var(--cx-text-muted); }
.project-item__title { font-size: var(--cx-text-xl); font-weight: 700; color: var(--cx-text); margin-bottom: var(--cx-space-3); }
.project-item__desc { font-size: var(--cx-text-sm); color: var(--cx-text-2); line-height: 1.7; margin-bottom: var(--cx-space-6); }
.project-item__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--cx-space-4); border-top: 1px solid var(--cx-border-soft); padding-top: var(--cx-space-4); flex-wrap: wrap; }
.project-item__financials { display: flex; align-items: center; gap: var(--cx-space-6); }
.project-item__fin-item span { font-size: var(--cx-text-xs); text-transform: uppercase; color: var(--cx-text-muted); font-weight: 600; display: block; }
.project-item__fin-item strong { font-size: var(--cx-text-xl); font-weight: 800; color: var(--cx-text); }
.project-item__fin-divider { width: 1px; height: 28px; background: var(--cx-border-soft); }
.project-item__actions { display: flex; gap: var(--cx-space-3); }
.cx-btn-action { padding: 7px 16px; border-radius: var(--cx-radius-md); font-size: var(--cx-text-sm); font-weight: 600; cursor: pointer; border: 1px solid var(--cx-border); color: var(--cx-text-2); background: transparent; }
.cx-btn-action:hover { border-color: var(--cx-primary); color: var(--cx-primary); background: var(--cx-primary-alpha); }
.cx-btn-action--danger { color: #b91c1c; border-color: #fecaca; }

/* ESTILOS DO MODAL DE CHAT */
.chat-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.chat-modal {
  background: #ffffff;
  width: 100%;
  max-width: 500px;
  height: 600px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.chat-header {
  padding: 16px 20px;
  background: #0f172a;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.chat-sub { font-size: 0.75rem; color: #94a3b8; }
.chat-close { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-empty { text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 40px; }

.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #e2e8f0;
  color: #0f172a;
  align-self: flex-start;
  position: relative;
}

.chat-bubble--mine {
  background: var(--cx-primary);
  color: #fff;
  align-self: flex-end;
}

.bubble-autor {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 2px;
  opacity: 0.8;
}

.chat-bubble p { margin: 0; font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
.bubble-time { display: block; font-size: 0.65rem; text-align: right; margin-top: 4px; opacity: 0.7; }

.chat-footer {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
}

.chat-footer input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
}

.cx-btn-primary {
  background: var(--cx-primary);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.cx-btn-primary:hover { background: var(--cx-primary-dark); }

/* ESTILOS DA BARRA DE FILTROS DE PROJETOS */
.filter-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--cx-space-4);
  background: var(--cx-surface);
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-xl);
  padding: var(--cx-space-4) var(--cx-space-5);
  margin-bottom: var(--cx-space-6);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--cx-space-3);
  flex: 1;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 130px;
}

.filter-item label {
  font-size: var(--cx-text-xs);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--cx-text-muted);
  letter-spacing: 0.04em;
}

.filter-item select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-sm);
  font-family: var(--cx-font-sans);
  color: var(--cx-text);
  background: var(--cx-bg);
  box-sizing: border-box;
}

.filter-item select:focus {
  outline: none;
  border-color: var(--cx-primary);
}

.filter-reset-btn {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 8px 14px;
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-xs);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--cx-transition-fast);
}

.filter-reset-btn:hover {
  background: #fee2e2;
}
</style>