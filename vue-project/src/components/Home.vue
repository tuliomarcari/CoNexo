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

    <!-- ─── PROJETOS EM DESTAQUE ──────────────────────────────────────────── -->
    <section class="projects cx-section cx-section--alt" aria-labelledby="projects-title">
      <div class="cx-container">
        <div class="cx-section-header">
          <span class="cx-label">Oportunidades</span>
          <h2 id="projects-title" class="cx-section-title">Projetos em destaque</h2>
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

        <div class="projects__grid" v-else>
          <article class="project-card" v-for="(p, i) in projetos" :key="i">
            <header class="project-card__head">
              <span class="project-card__badge">{{ p.nicho || 'Geral' }}</span>
              <span class="project-card__location">{{ p.cidade }}, {{ p.estado }}</span>
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
              </div>
              <button class="project-card__cta" @click="$emit('navegar', 'publicar')">
                Ver detalhes
              </button>
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
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  projetos: { type: Array, default: () => [] }
});

defineEmits(['navegar']);

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
  transition: box-shadow var(--cx-transition-base), border-color var(--cx-transition-base);
}

.project-card:hover {
  box-shadow: var(--cx-shadow-lg);
  border-color: rgba(13,156,110,0.2);
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

.project-card__cta {
  width: 100%;
  padding: 10px;
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
  .hero__inner {
    flex-direction: column;
    text-align: center;
  }
  .hero__image-wrapper {
    margin-top: var(--cx-space-10);
    order: -1; /* Coloca o mascote acima do texto no mobile se desejado, ou tire para ficar abaixo. Vou deixar abaixo (sem order -1). */
    order: 0;
  }
  .hero__title { font-size: var(--cx-text-4xl); margin-left: auto; margin-right: auto; }
  .hero__sub { margin-left: auto; margin-right: auto; }
  .hero__actions { justify-content: center; }
  .hero__stats { justify-content: center; }
  .how__steps { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .cx-container { padding: 0 var(--cx-space-5); }
  .hero__title { font-size: var(--cx-text-3xl); }
  .hero__sub { font-size: var(--cx-text-base); }
  .hero__stats { flex-direction: column; align-items: flex-start; gap: var(--cx-space-5); }
  .hero__stat-divider { width: 40px; height: 1px; }
  .cx-footer__inner { flex-direction: column; text-align: center; }
  .how__step { padding: var(--cx-space-6); }
}
</style>