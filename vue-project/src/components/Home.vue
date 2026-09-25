<template>
  <div class="home" ref="homeEl">

    <!-- ─── HERO ──────────────────────────────────────────────────────────── -->
    <section class="hero" aria-label="Seção principal">

      <!-- Fundo decorativo com parallax leve via JS (somente desktop, reduzido motion respeitado) -->
      <div class="hero__bg" aria-hidden="true">
        <div class="hero__orb hero__orb--1"></div>
        <div class="hero__orb hero__orb--2"></div>
        <div class="hero__grid"></div>
      </div>

      <div class="hero__inner cx-container">
        <div class="hero__content">
          <div class="hero__eyebrow">
            <span class="hero__pill">Plataforma de investimento colaborativo</span>
        </div>

        <h1 class="hero__title">
          Onde capital encontra<br>
          <span class="hero__title-accent">projetos reais.</span>
        </h1>

        <p class="hero__sub">
          CoNexo conecta empreendedores, ideias e investidores em um ambiente
          digital organizado, seguro e orientado a resultados.
        </p>

        <div class="hero__actions">
          <button class="hero__cta-primary" @click="$emit('navegar', 'publicar')">
            Ver projetos
          </button>
          <button class="hero__cta-secondary" @click="$emit('navegar', 'ideias')">
            Propor uma ideia
          </button>
        </div>

        <div class="hero__stats" aria-label="Números da plataforma">
          <div class="hero__stat">
            <strong>{{ projetos.length || '—' }}</strong>
            <span>Projetos ativos</span>
          </div>
          <div class="hero__stat-divider" aria-hidden="true"></div>
          <div class="hero__stat">
            <strong>100%</strong>
            <span>Curado manualmente</span>
          </div>
          <div class="hero__stat-divider" aria-hidden="true"></div>
          <div class="hero__stat">
            <strong>Gratuito</strong>
            <span>Para publicar ideias</span>
          </div>
        </div>
        </div>

        <div class="hero__image-wrapper">
          <img src="@/assets/Mascote.png" alt="Mascote CoNexo" class="hero__mascot" />
        </div>
      </div>
    </section>

    <!-- ─── COMO FUNCIONA ─────────────────────────────────────────────────── -->
    <section class="how cx-section" aria-labelledby="how-title">
      <div class="cx-container">
        <div class="cx-section-header">
          <span class="cx-label">Processo</span>
          <h2 id="how-title" class="cx-section-title">Como funciona</h2>
          <p class="cx-section-sub">
            Três etapas simples para conectar boas ideias a quem pode fazê-las crescer.
          </p>
        </div>

        <div class="how__steps">
          <div class="how__step" v-for="(s, i) in steps" :key="i">
            <div class="how__step-number" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="how__step-body">
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── EXPANSÃO POR FILIAIS E FRANQUIAS ──────────────────────────────── -->
    <section class="franchise-section cx-section" aria-labelledby="franchise-title">
      <div class="cx-container">
        <div class="franchise-banner">
          <div class="franchise-banner__header">
            <span class="cx-label">Modelo de Expansão</span>
            <h2 id="franchise-title" class="cx-section-title">Expansão por Filiais & Franquias</h2>
            <p class="cx-section-sub">
              Conectamos empreendedores e investidores a unidades locais de marcas consolidadas e modelos de negócio testados no mercado.
            </p>
          </div>

          <div class="franchise-cards">
            <div class="franchise-card">
              <div class="franchise-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 21h18M3 7v14M21 7v14M6 21V11m4 10V11m4 10V11m4 10V11M3 7l9-4 9 4"/>
                </svg>
              </div>
              <div class="franchise-card__content">
                <h3>Modelos Operacionais Testados</h3>
                <p>Marcas consolidadas disponibilizam unidades com processos estruturados, reduzindo riscos de implementação.</p>
              </div>
            </div>

            <div class="franchise-card">
              <div class="franchise-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="franchise-card__content">
                <h3>Oportunidades Regionais</h3>
                <p>Mapeamento de demanda por cidade e estado para aquisição de repasses de unidades ou abertura de filiais.</p>
              </div>
            </div>

            <div class="franchise-card">
              <div class="franchise-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="franchise-card__content">
                <h3>Transparência em Repasses</h3>
                <p>Valores de repasse, equity e condições de operação alinhadas diretamente entre fundadores e investidores.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── PROJETOS EM DESTAQUE ──────────────────────────────────────────── -->
    <section class="projects cx-section cx-section--alt" aria-labelledby="projects-title">
      <div class="cx-container">
        <div class="cx-section-header">
          <span class="cx-label">Oportunidades</span>
          <h2 id="projects-title" class="cx-section-title">Projetos em destaque</h2>
        </div>

        <!-- FILTROS RÁPIDOS DE MODELO DE NEGÓCIO -->
        <div class="home-filter-pills" v-if="projetos.length > 0">
          <button 
            type="button"
            class="pill-btn" 
            :class="{ 'pill-btn--active': filtroModelo === 'todos' }" 
            @click="filtroModelo = 'todos'"
          >
            ⚡ Todos
          </button>
          <button 
            type="button"
            class="pill-btn" 
            :class="{ 'pill-btn--active': filtroModelo === 'filiais' }" 
            @click="filtroModelo = 'filiais'"
          >
            🏬 Filiais & Franquias
          </button>
          <button 
            type="button"
            class="pill-btn" 
            :class="{ 'pill-btn--active': filtroModelo === 'originais' }" 
            @click="filtroModelo = 'originais'"
          >
            🚀 Negócios Originais
          </button>
        </div>

        <div v-if="projetos.length === 0" class="cx-empty" role="status">
          <div class="cx-empty__icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
              <path d="M15 7h2a5 5 0 0 1 0 10h-2"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <p>Nenhum projeto publicado ainda. Os aprovados aparecerão aqui.</p>
        </div>

        <div v-else-if="projetosEmDestaque.length === 0" class="cx-empty" role="status">
          <p>Nenhuma oportunidade encontrada para este filtro.</p>
        </div>

        <div class="projects__grid" v-else>
          <article class="project-card" v-for="p in projetosEmDestaque" :key="p.id">
            <!-- Imagem do Projeto / Logótipo com Fallback -->
            <div class="project-card__img-container" :class="{ 'project-card__img-container--placeholder': !(p.imagem_url || p.foto_url || p.imagem) }">
              <img 
                v-if="p.imagem_url || p.foto_url || p.imagem" 
                :src="p.imagem_url || p.foto_url || p.imagem" 
                :alt="p.empresa" 
                class="project-card__img" 
              />
              <template v-else>
                <div class="project-card__placeholder-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 2.5L21 7.5V16.5L12 21.5L3 16.5V7.5L12 2.5Z" stroke="currentColor" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="project-card__placeholder-text">{{ p.empresa }}</span>
              </template>
            </div>

            <header class="project-card__head">
              <span v-if="p.eh_filial || p.is_filial" class="project-card__badge project-card__badge--filial" :title="p.marca_principal ? 'Franquia: ' + p.marca_principal : 'Filial'">
                🏬 Filial {{ p.marca_principal ? '• ' + p.marca_principal : '' }}
              </span>
              <span v-else class="project-card__badge">{{ p.nicho || 'Geral' }}</span>
              
              <span class="project-card__location">
                📍 {{ (p.eh_filial || p.is_filial) && (p.cidade_filial || p.estado_filial) ? (p.cidade_filial || p.cidade) + ', ' + (p.estado_filial || p.estado) : p.cidade + ', ' + p.estado }}
              </span>
            </header>

            <h3 class="project-card__title">{{ p.empresa }}</h3>
            <p class="project-card__desc">{{ p.descricao }}</p>
            <footer class="project-card__foot">
              <div class="project-card__meta">
                <div class="project-card__meta-item">
                  <span class="project-card__meta-label">Captação</span>
                  <strong class="project-card__meta-value">R$ {{ Number(p.valor).toLocaleString('pt-BR') }}</strong>
                </div>
                <div class="project-card__meta-item">
                  <span class="project-card__meta-label">Equity</span>
                  <strong class="project-card__meta-value">{{ p.porcentagem }}%</strong>
                </div>
                <div v-if="(p.eh_filial || p.is_filial) && p.valor_repasse" class="project-card__meta-item project-card__meta-item--repasse">
                  <span class="project-card__meta-label">Repasse Filial</span>
                  <strong class="project-card__meta-value text-emerald">R$ {{ Number(p.valor_repasse).toLocaleString('pt-BR') }}</strong>
                </div>
              </div>

              <div class="project-card__actions">
                <!-- BOTÕES DE LIKE E DISLIKE -->
                <div class="vote-group">
                  <button 
                    type="button"
                    class="vote-btn vote-btn--like"
                    :class="{ 'vote-btn--active-like': p.meu_voto === 'like' }"
                    @click.stop="votar(p, 'like')"
                    title="Achei um bom projeto"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    <span>{{ p.likes || 0 }}</span>
                  </button>

                  <button 
                    type="button"
                    class="vote-btn vote-btn--dislike"
                    :class="{ 'vote-btn--active-dislike': p.meu_voto === 'dislike' }"
                    @click.stop="votar(p, 'dislike')"
                    title="Não achei um bom projeto"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                    </svg>
                    <span>{{ p.dislikes || 0 }}</span>
                  </button>
                </div>

                <button class="project-card__cta" @click="$emit('navegar', 'publicar')">
                  Ver detalhes
                </button>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER SIMPLES ────────────────────────────────────────────────── -->
    <footer class="cx-footer">
      <div class="cx-container cx-footer__inner">
        <span class="cx-footer__brand">
          <strong>Co</strong>Nexo
        </span>
        <p class="cx-footer__copy">© {{ new Date().getFullYear() }} CoNexo. Todos os direitos reservados.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { API_URL } from '../config';

const props = defineProps({
  projetos: { type: Array, default: () => [] },
  user: { type: Object, default: null }
});

defineEmits(['navegar']);

const filtroModelo = ref('todos'); // 'todos', 'filiais', 'originais'

const projetosEmDestaque = computed(() => {
  if (!props.projetos) return [];
  
  let lista = [...props.projetos];
  if (filtroModelo.value === 'filiais') {
    lista = lista.filter(p => Boolean(p.eh_filial || p.is_filial));
  } else if (filtroModelo.value === 'originais') {
    lista = lista.filter(p => !Boolean(p.eh_filial || p.is_filial));
  }

  return lista.sort((a, b) => {
    const saldoA = (a.likes || 0) - (a.dislikes || 0);
    const saldoB = (b.likes || 0) - (b.dislikes || 0);
    if (saldoB !== saldoA) return saldoB - saldoA;
    if ((b.likes || 0) !== (a.likes || 0)) return (b.likes || 0) - (a.likes || 0);
    return (b.id || 0) - (a.id || 0);
  });
});

const votar = async (item, tipo) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Você precisa estar conectado para votar nos projetos.");
    return;
  }

  try {
    const res = await axios.put(
      `${API_URL}/projetos/${item.id}/votar`,
      { tipo },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    item.likes = res.data.likes;
    item.dislikes = res.data.dislikes;
    item.meu_voto = res.data.meu_voto;
  } catch (err) {
    console.error("Erro ao votar no projeto:", err);
    if (err.response?.status === 401) {
      alert("Sua sessão expirou. Faça login novamente para votar.");
    } else {
      const mensagemErro = err.response?.data?.error || err.response?.data?.message || "Erro ao registrar seu voto. Verifique sua conexão e tente novamente.";
      alert(mensagemErro);
    }
  }
};

const steps = [
  {
    title: 'Proponha ou publique',
    text: 'Empreendedores publicam seus projetos com metas, equity e contato. Qualquer pessoa pode propor ideias para validação.'
  },
  {
    title: 'Curadoria e aprovação',
    text: 'Nossa equipe revisa cada submissão antes de torná-la pública, garantindo qualidade e credibilidade ao ambiente.'
  },
  {
    title: 'Conecte e negocie',
    text: 'Investidores acessam projetos aprovados e iniciam conversas diretas com os empreendedores por WhatsApp ou e-mail.'
  }
];

// ─── Parallax sutil no hero — somente desktop, respeita prefers-reduced-motion ─
const homeEl = ref(null);
let ticking = false;
let rafId = null;

const handleScroll = () => {
  if (ticking) return;
  ticking = true;
  rafId = requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    const orb1 = homeEl.value?.querySelector('.hero__orb--1');
    const orb2 = homeEl.value?.querySelector('.hero__orb--2');
    const mascotWrapper = homeEl.value?.querySelector('.hero__image-wrapper');
    
    if (orb1) orb1.style.transform = `translateY(${scrollY * 0.12}px)`;
    if (orb2) orb2.style.transform = `translateY(${scrollY * 0.07}px)`;
    // Aplicamos o parallax no wrapper, para não brigar com o transform da animação CSS do mascote
    if (mascotWrapper) mascotWrapper.style.transform = `translateY(${scrollY * 0.08}px)`;
    
    ticking = false;
  });
};

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  if (!prefersReduced && !isMobile) {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped>
/* ─── Utilitários de layout ─────────────────────────────────────────────────── */
.cx-container {
  width: 100%;
  max-width: var(--cx-container);
  margin: 0 auto;
  padding: 0 var(--cx-space-8);
}

.cx-section {
  padding: var(--cx-space-24) 0;
}

.cx-section--alt {
  background: var(--cx-bg-alt);
}

.cx-section-header {
  text-align: center;
  margin-bottom: var(--cx-space-16);
}

.cx-label {
  display: inline-block;
  font-size: var(--cx-text-xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cx-primary);
  margin-bottom: var(--cx-space-3);
}

.cx-section-title {
  font-size: var(--cx-text-3xl);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.02em;
  margin-bottom: var(--cx-space-4);
  line-height: 1.2;
}

.cx-section-sub {
  font-size: var(--cx-text-lg);
  color: var(--cx-text-muted);
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
.hero {
  position: relative;
  background: var(--cx-dark);
  min-height: 92vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.hero__orb--1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(13, 156, 110, 0.18) 0%, transparent 70%);
  top: -120px;
  right: 5%;
}

.hero__orb--2 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(13, 156, 110, 0.10) 0%, transparent 70%);
  bottom: -60px;
  left: 8%;
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
}

.hero__inner {
  position: relative;
  z-index: 1;
  padding-top: var(--cx-space-16);
  padding-bottom: var(--cx-space-16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cx-space-10);
}

.hero__content {
  flex: 1;
  max-width: 640px;
}

.hero__image-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero__mascot {
  max-width: 100%;
  height: auto;
  max-height: 500px;
  animation: float 6s ease-in-out infinite;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.3));
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.hero__eyebrow {
  margin-bottom: var(--cx-space-6);
}

.hero__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--cx-space-2);
  font-size: var(--cx-text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cx-primary);
  background: var(--cx-primary-alpha);
  border: 1px solid rgba(13, 156, 110, 0.25);
  padding: 5px 14px;
  border-radius: var(--cx-radius-full);
}

.hero__title {
  font-size: var(--cx-text-5xl);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.08;
  letter-spacing: -0.04em;
  margin-bottom: var(--cx-space-6);
  max-width: 720px;
}

.hero__title-accent {
  color: var(--cx-primary);
}

.hero__sub {
  font-size: var(--cx-text-lg);
  color: rgba(240, 244, 248, 0.65);
  max-width: 560px;
  line-height: 1.75;
  margin-bottom: var(--cx-space-10);
}

.hero__actions {
  display: flex;
  gap: var(--cx-space-4);
  flex-wrap: wrap;
  margin-bottom: var(--cx-space-16);
}

.hero__cta-primary {
  background: var(--cx-primary);
  color: #fff;
  border: none;
  padding: 14px 30px;
  border-radius: var(--cx-radius-lg);
  font-size: var(--cx-text-base);
  font-weight: 600;
  font-family: var(--cx-font-sans);
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background var(--cx-transition-base), box-shadow var(--cx-transition-base);
}

.hero__cta-primary:hover {
  background: var(--cx-primary-dark);
  box-shadow: var(--cx-shadow-primary);
}

.hero__cta-secondary {
  background: transparent;
  color: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.18);
  padding: 14px 30px;
  border-radius: var(--cx-radius-lg);
  font-size: var(--cx-text-base);
  font-weight: 500;
  font-family: var(--cx-font-sans);
  cursor: pointer;
  transition: border-color var(--cx-transition-base), color var(--cx-transition-base);
}

.hero__cta-secondary:hover {
  border-color: rgba(255,255,255,0.4);
  color: #ffffff;
}

/* Hero Stats */
.hero__stats {
  display: flex;
  align-items: center;
  gap: var(--cx-space-8);
  padding-top: var(--cx-space-8);
  border-top: 1px solid rgba(255,255,255,0.07);
}

.hero__stat strong {
  display: block;
  font-size: var(--cx-text-2xl);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1;
}

.hero__stat span {
  display: block;
  font-size: var(--cx-text-xs);
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-top: 4px;
}

.hero__stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.08);
  flex-shrink: 0;
}

/* ─── Como Funciona ─────────────────────────────────────────────────────────── */
.how {
  background: var(--cx-surface);
}

.how__steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--cx-space-8);
}

.how__step {
  padding: var(--cx-space-8);
  border: 1px solid var(--cx-border-soft);
  border-radius: var(--cx-radius-xl);
  background: var(--cx-bg);
  position: relative;
  transition: border-color var(--cx-transition-base), box-shadow var(--cx-transition-base);
}

.how__step:hover {
  border-color: var(--cx-border);
  box-shadow: var(--cx-shadow-md);
}

.how__step-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--cx-primary);
  opacity: 0.15;
  line-height: 1;
  margin-bottom: var(--cx-space-6);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.how__step-body h3 {
  font-size: var(--cx-text-lg);
  font-weight: 700;
  color: var(--cx-text);
  margin-bottom: var(--cx-space-3);
  letter-spacing: -0.01em;
}

.how__step-body p {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-muted);
  line-height: 1.75;
}

/* ─── Projetos ──────────────────────────────────────────────────────────────── */
.projects__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--cx-space-6);
}

.project-card {
  background: var(--cx-surface);
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-xl);
  padding: var(--cx-space-6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow var(--cx-transition-base), border-color var(--cx-transition-base);
}

.project-card:hover {
  box-shadow: var(--cx-shadow-lg);
  border-color: rgba(13,156,110,0.2);
}

.project-card__img-container {
  width: calc(100% + 2 * var(--cx-space-6));
  margin: calc(-1 * var(--cx-space-6)) calc(-1 * var(--cx-space-6)) var(--cx-space-4) calc(-1 * var(--cx-space-6));
  height: 180px;
  overflow: hidden;
  position: relative;
  background: var(--cx-bg-alt);
}

.project-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.project-card:hover .project-card__img {
  transform: scale(1.05);
}

.project-card__img-container--placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.9));
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.project-card__placeholder-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-card__placeholder-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.02em;
}

.project-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--cx-space-4);
}

.project-card__badge {
  font-size: var(--cx-text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cx-primary);
  background: var(--cx-primary-light);
  padding: 3px 10px;
  border-radius: var(--cx-radius-full);
}

.project-card__location {
  font-size: var(--cx-text-xs);
  color: var(--cx-text-muted);
}

.project-card__title {
  font-size: var(--cx-text-xl);
  font-weight: 700;
  color: var(--cx-text);
  letter-spacing: -0.01em;
  margin-bottom: var(--cx-space-3);
}

.project-card__desc {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-2);
  line-height: 1.7;
  flex: 1;
  margin-bottom: var(--cx-space-6);
}

.project-card__foot {
  border-top: 1px solid var(--cx-border-soft);
  padding-top: var(--cx-space-5);
}

.project-card__meta {
  display: flex;
  gap: var(--cx-space-8);
  margin-bottom: var(--cx-space-5);
}

.project-card__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-card__meta-label {
  font-size: var(--cx-text-xs);
  color: var(--cx-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.project-card__meta-value {
  font-size: var(--cx-text-lg);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.02em;
}

.project-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cx-space-3);
  flex-wrap: wrap;
}

.project-card__cta {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-md);
  color: var(--cx-text-2);
  font-size: var(--cx-text-sm);
  font-weight: 600;
  font-family: var(--cx-font-sans);
  cursor: pointer;
  transition: border-color var(--cx-transition-fast), color var(--cx-transition-fast), background var(--cx-transition-fast);
}

.project-card__cta:hover {
  border-color: var(--cx-primary);
  color: var(--cx-primary);
  background: var(--cx-primary-alpha);
}

/* BOTÕES DE VOTAÇÃO */
.vote-group {
  display: flex;
  align-items: center;
  gap: var(--cx-space-2);
}

.vote-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-xs);
  font-weight: 600;
  font-family: var(--cx-font-sans);
  border: 1px solid var(--cx-border);
  background: var(--cx-bg);
  color: var(--cx-text-2);
  cursor: pointer;
  transition: border-color var(--cx-transition-fast), color var(--cx-transition-fast), background var(--cx-transition-fast);
}

.vote-btn svg {
  flex-shrink: 0;
}

.vote-btn--like:hover, .vote-btn--active-like {
  border-color: var(--cx-primary);
  color: var(--cx-primary-dark);
  background: var(--cx-primary-light);
}

.vote-btn--dislike:hover, .vote-btn--active-dislike {
  border-color: #fecaca;
  color: #b91c1c;
  background: #fef2f2;
}

/* ─── Empty state ───────────────────────────────────────────────────────────── */
.cx-empty {
  text-align: center;
  padding: var(--cx-space-20) var(--cx-space-8);
  color: var(--cx-text-muted);
  border: 1px dashed var(--cx-border);
  border-radius: var(--cx-radius-xl);
  background: var(--cx-surface);
}

.cx-empty__icon {
  margin: 0 auto var(--cx-space-4);
  width: 48px;
  height: 48px;
  color: var(--cx-text-faint);
}

.cx-empty p {
  font-size: var(--cx-text-sm);
  line-height: 1.7;
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
.cx-footer {
  background: var(--cx-dark);
  border-top: 1px solid var(--cx-dark-border);
  padding: var(--cx-space-8) 0;
}

.cx-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cx-space-4);
}

.cx-footer__brand {
  font-size: var(--cx-text-lg);
  color: rgba(255,255,255,0.5);
  letter-spacing: -0.01em;
}

.cx-footer__brand strong {
  color: var(--cx-primary);
  font-weight: 800;
}

.cx-footer__copy {
  font-size: var(--cx-text-xs);
  color: rgba(255,255,255,0.3);
}

/* ─── Responsivo ────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .hero {
    min-height: auto;
    padding-top: calc(var(--cx-navbar-h) + 20px);
    padding-bottom: var(--cx-space-12);
  }
  .hero__inner {
    flex-direction: column;
    text-align: center;
    padding-top: 1.5rem;
    padding-bottom: 2rem;
    gap: var(--cx-space-6);
  }
  .hero__eyebrow {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
    margin-bottom: 1.2rem;
  }
  .hero__pill {
    font-size: 0.72rem;
    padding: 6px 14px;
    text-align: center;
    line-height: 1.35;
    white-space: normal;
    word-break: break-word;
  }
  .hero__image-wrapper {
    margin-top: var(--cx-space-6);
    order: 0;
  }
  .hero__mascot {
    max-height: 320px;
  }
  .hero__title {
    font-size: 2.2rem;
    line-height: 1.15;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 1rem;
  }
  .hero__sub {
    font-size: 1rem;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 1.5rem;
  }
  .hero__actions {
    justify-content: center;
    margin-bottom: 2rem;
  }
  .hero__stats {
    justify-content: center;
  }
  .how__steps { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .cx-container { padding: 0 var(--cx-space-4); }
  .hero {
    padding-top: calc(var(--cx-navbar-h) + 24px);
  }
  .hero__inner {
    padding-top: 1rem;
  }
  .hero__eyebrow {
    margin-top: 0.25rem;
    margin-bottom: 1rem;
  }
  .hero__pill {
    font-size: 0.68rem;
    letter-spacing: 0.05em;
    padding: 5px 12px;
  }
  .hero__title {
    font-size: 1.85rem;
    line-height: 1.18;
  }
  .hero__sub {
    font-size: 0.95rem;
    line-height: 1.6;
  }
  .hero__actions {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
  .hero__cta-primary,
  .hero__cta-secondary {
    width: 100%;
    text-align: center;
    padding: 12px 20px;
  }
  .hero__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    text-align: center;
    padding-top: 1.25rem;
    width: 100%;
  }
  .hero__stat strong {
    font-size: 1.2rem;
  }
  .hero__stat span {
    font-size: 0.68rem;
  }
  .hero__stat-divider {
    display: none;
  }
  .cx-footer__inner { flex-direction: column; text-align: center; }
  .how__step { padding: var(--cx-space-6); }
}

.home-filter-pills {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.pill-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cx-text-muted, #94a3b8);
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.pill-btn--active {
  background: #10b981;
  color: #0f172a;
  font-weight: 600;
  border-color: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

.project-card__badge--filial {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.project-card__meta-item--repasse {
  grid-column: span 2;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px stroke rgba(255, 255, 255, 0.05);
}

.text-emerald {
  color: #10b981 !important;
}

/* ─── SECÇÃO EXPLICATIVA DE FILIAIS & FRANQUIAS ─────────────────── */
.franchise-section {
  padding: 4.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%);
}

.franchise-banner__header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 3rem auto;
}

.franchise-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.franchise-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.franchise-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.15);
}

.franchise-card__icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.franchise-card__content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.franchise-card__content p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--cx-text-muted, #94a3b8);
}

@media (max-width: 900px) {
  .franchise-cards {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>