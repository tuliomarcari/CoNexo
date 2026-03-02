<template>
  <div class="about-page">
    <section class="about-hero">
      <div class="content-limit">
        <span class="badge">Nossa História</span>
        <h1>Conectando o futuro do <span class="highlight">empreendedorismo.</span></h1>
        <p class="lead">
          A CoNexo nasceu com o propósito de democratizar o acesso ao investimento e transformar ideias inovadoras em negócios de escala global.
        </p>
      </div>
    </section>

    <section class="about-grid">
      <div class="content-limit">
        <div class="cards-container">
          <div class="info-card">
            <span class="icon">🎯</span>
            <h3>Missão</h3>
            <p>Facilitar a conexão entre mentes criativas e investidores que buscam impacto real no mercado.</p>
          </div>
          <div class="info-card">
            <span class="icon">🚀</span>
            <h3>Visão</h3>
            <p>Ser a maior plataforma colaborativa de negócios da América Latina até 2030.</p>
          </div>
          <div class="info-card">
            <span class="icon">🤝</span>
            <h3>Valores</h3>
            <p>Transparência, inovação constante, segurança jurídica e foco no crescimento mútuo.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-details">
      <div class="content-limit detail-inner">
        <div class="text-side">
          <h2>Por que a CoNexo?</h2>
          <p>
            Acreditamos que grandes projetos morrem por falta de oportunidade, não de talento. Nossa plataforma elimina barreiras burocráticas, permitindo que empresas publiquem suas metas e recebam aportes de forma direta e segura.
          </p>
          <button class="btn-cta" @click="$emit('navegar', 'publicar')">Faça parte da rede</button>
        </div>
        <div class="visual-side">
          <div class="abstract-shape">⬢</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineEmits(['navegar']);
</script>

<style scoped>
.about-page { width: 100%; background-color: #ffffff; }
.content-limit { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* HERO */
.about-hero { padding: 100px 0 60px; text-align: center; background: #f8fafc; }
.badge { background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
h1 { font-size: 3.5rem; color: #1e293b; margin: 20px 0; font-weight: 800; line-height: 1.2; }
.highlight { color: #10b981; }
.lead { font-size: 1.25rem; color: #64748b; max-width: 800px; margin: 0 auto; line-height: 1.6; }

/* GRID CARDS */
.about-grid { padding: 80px 0; }
.cards-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.info-card { background: white; padding: 40px; border-radius: 20px; border: 1px solid #e2e8f0; transition: 0.3s; }
.info-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
.icon { font-size: 2.5rem; display: block; margin-bottom: 20px; }
.info-card h3 { font-size: 1.5rem; color: #1e293b; margin-bottom: 15px; }
.info-card p { color: #64748b; line-height: 1.6; }

/* DETAILS */
.about-details { padding: 100px 0; background: #051614; color: white; }
.detail-inner { display: flex; align-items: center; gap: 60px; }
.text-side { flex: 1; }
.text-side h2 { font-size: 2.5rem; margin-bottom: 25px; }
.text-side p { font-size: 1.1rem; color: #94a3b8; line-height: 1.8; margin-bottom: 35px; }
.btn-cta { background: #10b981; color: white; border: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; cursor: pointer; }

.visual-side { flex: 1; display: flex; justify-content: center; }
.abstract-shape { font-size: 15rem; color: #10b981; opacity: 0.2; }

@media (max-width: 900px) {
  .cards-container { grid-template-columns: 1fr; }
  .detail-inner { flex-direction: column; text-align: center; }
  h1 { font-size: 2.5rem; }
}
</style>