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
  rodape: 'compacto',
  cor_primaria: '#10b981',
  cor_secundaria: '#0f172a',
  cor_terciaria: '#ffffff'
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
      rodape_estilo: configLoja.rodape,
      cor_primaria: configLoja.cor_primaria,
      cor_secundaria: configLoja.cor_secundaria,
      cor_terciaria: configLoja.cor_terciaria
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
  <div class="page-shell">
    <div class="page-inner builder-view">
      <div class="page-header">
        <h1 class="page-header__title">Criar Loja</h1>
        <p class="page-header__sub">Personalize a vitrine virtual da sua loja selecionando os blocos e cores abaixo.</p>
      </div>

      <div class="builder-grid">
        <!-- ESQUERDA: CONTROLES DE SELEÇÃO -->
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

          <!-- BLOCO DE CORES -->
          <div class="control-box">
            <h3>4. Cores da Identidade</h3>
            <div class="color-picker-group">
              <label class="color-picker-item">
                <span>Cor Primária (Destaques/Botões)</span>
                <div class="color-input-wrapper">
                  <input type="color" v-model="configLoja.cor_primaria" class="color-input" />
                  <code>{{ configLoja.cor_primaria }}</code>
                </div>
              </label>

              <label class="color-picker-item">
                <span>Cor Secundária (Cabeçalho/Rodapé)</span>
                <div class="color-input-wrapper">
                  <input type="color" v-model="configLoja.cor_secundaria" class="color-input" />
                  <code>{{ configLoja.cor_secundaria }}</code>
                </div>
              </label>

              <label class="color-picker-item">
                <span>Cor Terciária (Fundo dos Produtos)</span>
                <div class="color-input-wrapper">
                  <input type="color" v-model="configLoja.cor_terciaria" class="color-input" />
                  <code>{{ configLoja.cor_terciaria }}</code>
                </div>
              </label>
            </div>
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

          <div class="custom-support-box">
            <h4>Quer um site totalmente sob medida?</h4>
            <p>Fale diretamente com os desenvolvedores da CoNexo.</p>
            <a href="https://wa.me/5514999999999" target="_blank" class="btn-support">
              Falar com a Equipe
            </a>
          </div>
        </div>

        <!-- DIREITA: PREVIEW AO VIVO DINÂMICO -->
        <div class="builder-preview">
          <div class="preview-badge">Preview Ao Vivo</div>
          
          <div class="store-canvas">
            <!-- BANNER -->
            <div 
              :class="['store-banner', configLoja.banner]"
              :style="{ backgroundColor: configLoja.cor_secundaria, color: '#ffffff' }"
            >
              <h1 :style="{ color: configLoja.cor_primaria }">{{ configLoja.nome_loja || 'Nome da Sua Loja' }}</h1>
              <p v-if="configLoja.banner === 'estatico'">Bem-vindo à nossa loja virtual oficial!</p>
              <p v-else>‹ Slide 1 de 3: Lançamentos e Ofertas ›</p>
            </div>

            <!-- SEÇÃO DE PRODUTOS COM COR TERCIÁRIA NO FUNDO -->
            <div 
              class="store-body"
              :style="{ backgroundColor: configLoja.cor_terciaria }"
            >
              <h3>Nossos Produtos</h3>
              <div v-if="configLoja.vitrine === 'grid'" class="grid-products">
                <div class="product-item" v-for="i in 3" :key="i">
                  <div class="img-ph"></div>
                  <p>Produto {{ i }}</p>
                  <strong :style="{ color: configLoja.cor_primaria }">R$ 99,90</strong>
                </div>
              </div>
              <div v-else class="featured-products">
                <div class="product-item feat-main">
                  <div class="img-ph lg"></div>
                  <p>Destaque Principal</p>
                  <strong :style="{ color: configLoja.cor_primaria }">R$ 199,90</strong>
                </div>
                <div class="feat-side">
                  <div class="product-item" v-for="i in 2" :key="i">
                    <p>Item {{ i }}</p>
                    <strong :style="{ color: configLoja.cor_primaria }">R$ 49,90</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- RODAPÉ -->
            <div 
              :class="['store-footer', configLoja.rodape]"
              :style="{ backgroundColor: configLoja.cor_secundaria }"
            >
              <p v-if="configLoja.rodape === 'compacto'">© 2026 {{ configLoja.nome_loja || 'Sua Loja' }} — Todos os direitos reservados.</p>
              <div v-else class="footer-wa">
                <p>© 2026 {{ configLoja.nome_loja || 'Sua Loja' }}</p>
                <span class="wa-btn" :style="{ backgroundColor: configLoja.cor_primaria }">💬 Suporte via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-shell {
  background: var(--cx-bg);
  min-height: calc(100vh - var(--cx-navbar-h));
}

.builder-view {
  max-width: var(--cx-container);
  margin: 0 auto;
  padding: var(--cx-space-12) var(--cx-space-8);
  color: var(--cx-text);
}

.page-header {
  margin-bottom: var(--cx-space-10);
  border-bottom: 1px solid var(--cx-border-soft);
  padding-bottom: var(--cx-space-6);
}

.page-header__title {
  font-size: var(--cx-text-3xl);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.03em;
  margin-bottom: var(--cx-space-2);
}

.page-header__sub {
  font-size: var(--cx-text-base);
  color: var(--cx-text-muted);
}

.builder-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
}

.builder-controls {
  background: var(--cx-surface);
  padding: 24px;
  border-radius: var(--cx-radius-xl);
  border: 1px solid var(--cx-border);
  box-shadow: var(--cx-shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-box h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--cx-primary);
  margin-bottom: 10px;
}

.control-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--cx-text-2);
}

.builder-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--cx-border);
  background: var(--cx-bg);
  color: var(--cx-text);
  font-size: 0.9rem;
  box-sizing: border-box;
}

.builder-input:focus {
  outline: none;
  border-color: var(--cx-primary);
}

.color-picker-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-picker-item span {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--cx-text-2);
  margin-bottom: 4px;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  -webkit-appearance: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: 1px solid var(--cx-border);
  border-radius: 6px;
}

.color-input-wrapper code {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cx-text-2);
}

.radio-card {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 8px;
  cursor: pointer;
  color: var(--cx-text-2);
}

.btn-save {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
}

.custom-support-box {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 16px;
  border-radius: 12px;
  margin-top: 10px;
}

.custom-support-box h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--cx-text);
  margin-bottom: 6px;
}

.custom-support-box p {
  font-size: 0.85rem;
  color: var(--cx-text-muted);
  margin-bottom: 12px;
}

.btn-support {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cx-primary);
  text-decoration: none;
  border: 1px solid var(--cx-primary);
  padding: 7px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-support:hover {
  background: var(--cx-primary);
  color: #ffffff;
}

.builder-preview {
  background: var(--cx-surface);
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-xl);
  padding: 24px;
  position: relative;
  box-shadow: var(--cx-shadow-sm);
}

.preview-badge {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--cx-bg-alt);
  border: 1px solid var(--cx-border);
  padding: 4px 12px;
  border-radius: 12px;
  color: var(--cx-text-muted);
}

.store-canvas {
  background: #ffffff;
  color: #0f172a;
  border-radius: 12px;
  border: 1px solid var(--cx-border);
  overflow: hidden;
  margin-top: 24px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.store-banner {
  padding: 40px 20px;
  text-align: center;
  transition: background-color 0.3s ease;
}

.store-banner h1 {
  font-size: 1.6rem;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.store-body {
  padding: 24px;
  flex: 1;
  transition: background-color 0.3s ease;
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
  background: #ffffff;
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
  color: #ffffff;
  padding: 16px 20px;
  font-size: 0.85rem;
  text-align: center;
  transition: background-color 0.3s ease;
}

.footer-wa {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wa-btn {
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

@media (max-width: 1024px) {
  .builder-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .builder-view {
    padding: var(--cx-space-6) var(--cx-space-4);
  }

  .builder-controls,
  .builder-preview {
    padding: 16px;
  }

  .grid-products {
    grid-template-columns: 1fr;
  }

  .featured-products {
    flex-direction: column;
  }
}
</style>