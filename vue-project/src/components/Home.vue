<template>
  <div class="home-wrapper">
    
    <section class="hero-section">
      <div class="content-limit hero-inner">
        <div class="hero-text">
          <h1>Invista em ideias.<br><span class="highlight">Construa negócios.</span></h1>
          <p>
            A CoNexo conecta ideias inovadoras, empresas e investidores em um único ecossistema colaborativo.
          </p>
          
          <div class="hero-actions">
            <button class="btn-primary" @click="$emit('navegar', 'projetos')">
              Explorar Projetos
            </button>
            <button class="btn-secondary" @click="$emit('navegar', 'ideias')">
              Proponha uma ideia
            </button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hexagon-glow">⬢</div>
        </div>
      </div>
    </section>

    <section class="how-section">
      <div class="content-limit">
        <h2 class="section-title">Como funciona</h2>
        <div class="steps-grid">
          <div class="step-card" v-for="(item, index) in steps" :key="index">
            <span class="step-icon">{{ item.icon }}</span>
            <div class="step-details">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-projects">
      <div class="content-limit">
        <h2 class="section-title">Projetos em destaque</h2>
        
        <div class="projects-grid">
          <div v-for="(p, i) in projetos" :key="i" class="project-card">
            <div class="project-card-header">
              <span class="category-badge">{{ p.nicho || 'Geral' }}</span>
              <h3>{{ p.empresa }}</h3>
              <p>{{ p.descricao }}</p>
            </div>
            
            <div class="project-card-meta">
              <div class="meta-item">
                <span>Meta:</span>
                <strong>R$ {{ p.valor }}</strong>
              </div>
              <div class="meta-item">
                <span>Participação:</span>
                <strong>{{ p.porcentagem }}%</strong>
              </div>
            </div>
            
            <button class="btn-invest">Investir</button>
          </div>

          <div v-if="projetos.length === 0" class="empty-state">
            <p>Os projetos publicados aparecerão aqui automaticamente.</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
// Define a comunicação com o componente pai (App.vue)
const props = defineProps({
  projetos: {
    type: Array,
    default: () => []
  }
});

defineEmits(['navegar']);

const steps = [
  { icon: '💡', title: 'Proponha uma ideia', text: 'Compartilhe soluções para nichos e empresas reais.' },
  { icon: '📈', title: 'Publique um projeto', text: 'Empresas definem metas, cotas e participação.' },
  { icon: '💰', title: 'Invista com segurança', text: 'Invista valores fixos e participe do crescimento.' }
];
</script>

<style scoped>
.home-wrapper { width: 100%; }

/* CONTENT LIMITER (Centralizador) */
.content-limit {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* --- HERO SECTION --- */
.hero-section {
  width: 100%;
  background: linear-gradient(135deg, #051614 0%, #0a2521 100%);
  padding: 100px 0;
  display: flex;
  justify-content: center;
}

.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-text h1 {
  font-size: 4rem;
  color: white;
  line-height: 1.1;
  margin-bottom: 20px;
}

.highlight { color: #10b981; }

.hero-text p {
  font-size: 1.2rem;
  color: #94a3b8;
  max-width: 550px;
  margin-bottom: 40px;
}

/* ESTILO DOS BOTÕES */
.hero-actions { display: flex; gap: 20px; }

.btn-primary {
  background: #10b981;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover { background: #059669; transform: translateY(-3px); }

.btn-secondary {
  background: transparent;
  color: #10b981;
  border: 2px solid #10b981;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;
}

.btn-secondary:hover { background: rgba(16, 185, 129, 0.1); transform: translateY(-3px); }

.hero-visual { flex: 1; display: flex; justify-content: flex-end; }
.hexagon-glow { font-size: 15rem; color: #10b981; filter: drop-shadow(0 0 30px rgba(16, 185, 129, 0.3)); }

/* --- SEÇÕES COMUNS --- */
.section-title { font-size: 2.5rem; color: #0f172a; margin-bottom: 50px; font-weight: 800; }

.how-section { background: white; padding: 100px 0; display: flex; justify-content: center; }

.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.step-card { background: #f8fafc; padding: 30px; border-radius: 20px; text-align: left; }
.step-icon { font-size: 2.5rem; display: block; margin-bottom: 15px; }

/* --- PROJETOS EM DESTAQUE --- */
.featured-projects { background: #f1f5f9; padding: 100px 0; display: flex; justify-content: center; }

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.project-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: 0.3s ease;
}

.project-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }

.category-badge {
  background: #dcfce7;
  color: #166534;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  width: fit-content;
  margin-bottom: 15px;
}

.project-card h3 { color: #1e293b; margin-bottom: 10px; }
.project-card p { color: #64748b; font-size: 0.95rem; margin-bottom: 20px; flex-grow: 1; }

.project-card-meta {
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
  margin-bottom: 20px;
}

.meta-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; }
.meta-item strong { color: #1e293b; }

.btn-invest {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.empty-state { grid-column: 1/-1; text-align: center; padding: 50px; color: #94a3b8; border: 2px dashed #cbd5e1; border-radius: 16px; }

@media (max-width: 900px) {
  .hero-inner { flex-direction: column; text-align: center; }
  .hero-visual { display: none; }
  .hero-actions { justify-content: center; }
  .steps-grid { grid-template-columns: 1fr; }
}
</style>