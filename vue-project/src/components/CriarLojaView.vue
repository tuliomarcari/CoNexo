<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import { API_URL } from '../config';

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
});

const configLoja = reactive({
  nome_loja: '',
  banner: 'estatico',
  vitrine: 'grid',
  rodape: 'compacto'
});

const salvandoLoja = ref(false);

const salvarConfiguracaoLoja = async () => {
  salvandoLoja.value = true;
  try {
    const payload = {
      nome_loja: configLoja.nome_loja || 'Minha Loja CoNexo',
      usuario_id: props.user?.id || null,
      banner_estilo: configLoja.banner,
      vitrine_estilo: configLoja.vitrine,
      rodape_estilo: configLoja.rodape
    };

    await axios.post(`${API_URL}/lojas`, payload);
    alert("Layout da loja salvo com sucesso no banco de dados!");
  } catch (err) {
    console.error("Erro ao salvar loja:", err);
    alert("Erro ao salvar a configuração da loja.");
  } finally {
    salvandoLoja.value = false;
  }
};
</script>

<template>
  <section class="builder-view">
    <div class="builder-header">
      <h2>CoNexo Builder</h2>
      <p>Personalize a vitrine virtual da sua loja selecionando os blocos abaixo.</p>
    </div>

    <div class="builder-grid">
      <!-- ESQUERDA: OPÇÕES DE SELEÇÃO -->
      <div class="builder-controls">
        <div class="control-box">
          <label class="control-label">Nome da sua Loja</label>
          <input 
            type="text" 
            v-model="configLoja.nome_loja" 
            placeholder="Ex: Minha Boutique" 
            class="builder-input"
          />
        </div>

        <div class="control-box">
          <h3>1. Modelo de Banner</h3>
          <label class="radio-card">
            <input type="radio" value="estatico" v-model="configLoja.banner" />
            <span>Banner Estático Simples</span>
          </label>
          <label class="radio-card">
            <input type="radio" value="carrossel" v-model="configLoja.banner" />
            <span>Carrossel de Slides</span>
          </label>
        </div>

        <div class="control-box">
          <h3>2. Exposição de Produtos</h3>
          <label class="radio-card">
            <input type="radio" value="grid" v-model="configLoja.vitrine" />
            <span>Vitrine em Grade (Grid 3x3)</span>
          </label>
          <label class="radio-card">
            <input type="radio" value="destaque" v-model="configLoja.vitrine" />
            <span>Produto Principal em Destaque</span>
          </label>
        </div>

        <div class="control-box">
          <h3>3. Modelo de Rodapé</h3>
          <label class="radio-card">
            <input type="radio" value="compacto" v-model="configLoja.rodape" />
            <span>Rodapé Compacto</span>
          </label>
          <label class="radio-card">
            <input type="radio" value="whatsapp" v-model="configLoja.rodape" />
            <span>Rodapé com Ícone WhatsApp</span>
          </label>
        </div>

        <button 
          class="cx-btn-primary btn-save" 
          @click="salvarConfiguracaoLoja"
          :disabled="salvandoLoja"
        >
          {{ salvandoLoja ? 'Salvando...' : 'Salvar Minha Loja' }}
        </button>

        <!-- BLOCO DE ATENDIMENTO/CONTATO -->
        <div class="custom-support-box">
          <h4>Quer um site totalmente sob medida?</h4>
          <p>Fale diretamente com os desenvolvedores da CoNexo.</p>
          <a href="https://wa.me/5514999999999" target="_blank" class="btn-support">
            Falar com a Equipe
          </a>
        </div>
      </div>

      <!-- DIREITA: PREVIEW AO VIVO -->
      <div class="builder-preview">
        <div class="preview-badge">Preview Ao Vivo</div>
        
        <div class="store-canvas">
          <!-- DUMMY BANNER -->
          <div :class="['store-banner', configLoja.banner]">
            <h1>{{ configLoja.nome_loja || 'Nome da Sua Loja' }}</h1>
            <p v-if="configLoja.banner === 'estatico'">Bem-vindo à nossa loja virtual oficial!</p>
            <p v-else>‹ Slide 1 de 3: Lançamentos e Ofertas ›</p>
          </div>

          <!-- DUMMY VITRINE -->
          <div class="store-body">
            <h3>Nossos Produtos</h3>
            <div v-if="configLoja.vitrine === 'grid'" class="grid-products">
              <div class="product-item" v-for="i in 3" :key="i">
                <div class="img-ph"></div>
                <p>Produto {{ i }}</p>
                <strong>R$ 99,90</strong>
              </div>
            </div>
            <div v-else class="featured-products">
              <div class="product-item feat-main">
                <div class="img-ph lg"></div>
                <p>Destaque Principal</p>
                <strong>R$ 199,90</strong>
              </div>
              <div class="feat-side">
                <div class="product-item" v-for="i in 2" :key="i">
                  <p>Item {{ i }}</p>
                  <strong>R$ 49,90</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- DUMMY RODAPÉ -->
          <div :class="['store-footer', configLoja.rodape]">
            <p v-if="configLoja.rodape === 'compacto'">© 2026 {{ configLoja.nome_loja || 'Sua Loja' }} — Todos os direitos reservados.</p>
            <div v-else class="footer-wa">
              <p>© 2026 {{ configLoja.nome_loja || 'Sua Loja' }}</p>
              <span class="wa-btn">💬 Suporte via WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.builder-view {
  max-width: var(--cx-container);
  margin: 0 auto;
  padding: var(--cx-space-8);
  color: #ffffff;
}

.builder-header {
  margin-bottom: 24px;
}

.builder-header h2 {
  font-size: 1.8rem;
  color: var(--cx-primary);
  margin-bottom: 6px;
}

.builder-header p {
  color: var(--cx-text-faint);
}

.builder-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

.builder-controls {
  background: var(--cx-dark-2);
  padding: 20px;
  border-radius: var(--cx-radius-md);
  border: 1px solid var(--cx-dark-border);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-box h3 {
  font-size: 0.95rem;
  color: var(--cx-primary);
  margin-bottom: 10px;
}

.control-label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 6px;
  color: var(--cx-text-faint);
}

.builder-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--cx-dark-border);
  background: #0f172a;
  color: #ffffff;
}

.radio-card {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  margin-bottom: 8px;
  cursor: pointer;
  color: var(--cx-text-faint);
}

.btn-save {
  width: 100%;
  margin-top: 10px;
}

.custom-support-box {
  background: rgba(13, 156, 110, 0.08);
  border: 1px solid rgba(13, 156, 110, 0.3);
  padding: 16px;
  border-radius: 8px;
  margin-top: 10px;
}

.custom-support-box h4 {
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 6px;
}

.custom-support-box p {
  font-size: 0.8rem;
  color: var(--cx-text-faint);
  margin-bottom: 12px;
}

.btn-support {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cx-primary);
  text-decoration: none;
  border: 1px solid var(--cx-primary);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-support:hover {
  background: var(--cx-primary);
  color: #ffffff;
}

.builder-preview {
  background: var(--cx-dark-2);
  border: 1px solid var(--cx-dark-border);
  border-radius: var(--cx-radius-md);
  padding: 20px;
  position: relative;
}

.preview-badge {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 0.75rem;
  background: rgba(255,255,255,0.1);
  padding: 4px 10px;
  border-radius: 12px;
  color: var(--cx-text-faint);
}

.store-canvas {
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
}

.store-banner {
  padding: 40px 20px;
  text-align: center;
  background: #f1f5f9;
}

.store-banner.carrossel {
  background: #e2e8f0;
}

.store-banner h1 {
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.store-body {
  padding: 24px;
  flex: 1;
}

.store-body h3 {
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.grid-products {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.featured-products {
  display: flex;
  gap: 16px;
}

.feat-main {
  flex: 2;
}

.feat-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  border: 1px solid #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.img-ph {
  height: 80px;
  background: #cbd5e1;
  border-radius: 4px;
  margin-bottom: 8px;
}

.img-ph.lg {
  height: 120px;
}

.store-footer {
  background: #0f172a;
  color: #ffffff;
  padding: 16px 20px;
  font-size: 0.85rem;
  text-align: center;
}

.footer-wa {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wa-btn {
  background: #25d366;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .builder-grid {
    grid-template-columns: 1fr;
  }

  .grid-products {
    grid-template-columns: 1fr;
  }

  .featured-products {
    flex-direction: column;
  }
}
</style>