<template>
  <div class="auth-page">
    <div class="auth-layout">

      <!-- Painel lateral decorativo -->
      <div class="auth-panel" aria-hidden="true">
        <div class="auth-panel__bg"></div>
        <div class="auth-panel__content">
          <div class="auth-panel__brand">
            <strong>Co</strong>Nexo
          </div>
          <p class="auth-panel__tagline">
            Crie sua conta e comece a publicar projetos ou propor ideias para a comunidade.
          </p>
          <div class="auth-panel__divider"></div>
          <ul class="auth-panel__benefits">
            <li>Publicação de projetos gratuita</li>
            <li>Visibilidade para investidores reais</li>
            <li>Aprovação em até 48h</li>
          </ul>
        </div>
      </div>

      <!-- Formulário -->
      <div class="auth-form-area">
        <div class="auth-form-wrap">
          <div class="auth-form-head">
            <h1>Criar conta</h1>
            <p>Preencha os dados para começar a usar o CoNexo.</p>
          </div>

          <form @submit.prevent="registrar" class="auth-form" novalidate>
            <div class="auth-field">
              <label for="cad-nome">Nome completo</label>
              <input
                id="cad-nome"
                v-model="nome"
                type="text"
                placeholder="Seu nome"
                required
                autocomplete="name"
              />
            </div>

            <div class="auth-field">
              <label for="cad-email">E-mail</label>
              <input
                id="cad-email"
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                required
                autocomplete="email"
              />
            </div>

            <div class="auth-field">
              <label for="cad-senha">Senha</label>
              <input
                id="cad-senha"
                v-model="senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
                autocomplete="new-password"
              />
            </div>

            <button type="submit" class="auth-submit">Criar minha conta</button>
          </form>

          <p class="auth-footer-text">
            Já tem conta?
            <button class="auth-link" @click="$emit('ir-para-login')">Entrar agora</button>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { API_URL } from '../config';

const nome = ref('');
const email = ref('');
const senha = ref('');
const emit = defineEmits(['ir-para-login']);

const registrar = async () => {
  try {
    const res = await fetch(`${API_URL}/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.value,
        email: email.value,
        senha: senha.value,
        tipo: 'cliente'
      })
    });

    if (res.ok) {
      alert("Sucesso! Sua conta foi criada.");
      emit('ir-para-login');
    } else {
      const erro = await res.json();
      alert(erro.error || erro.mensagem || "Erro ao realizar cadastro.");
    }
  } catch (error) {
    alert("Erro de conexão com o servidor.");
  }
};
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--cx-navbar-h));
  display: flex;
  background: var(--cx-bg);
}

.auth-layout {
  display: flex;
  width: 100%;
  flex: 1;
}

/* ─── Painel lateral ─────────────────────────────────────────────────────────── */
.auth-panel {
  flex: 0 0 420px;
  position: relative;
  background: var(--cx-dark);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.auth-panel__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 60% at 80% 20%, rgba(13,156,110,0.15) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 20% 80%, rgba(13,156,110,0.08) 0%, transparent 70%);
}

.auth-panel__content {
  position: relative;
  z-index: 1;
  padding: var(--cx-space-12) var(--cx-space-12);
}

.auth-panel__brand {
  font-size: 1.6rem;
  font-weight: 300;
  color: rgba(255,255,255,0.7);
  letter-spacing: -0.02em;
  margin-bottom: var(--cx-space-8);
}

.auth-panel__brand strong {
  font-weight: 800;
  color: var(--cx-primary);
}

.auth-panel__tagline {
  font-size: var(--cx-text-lg);
  color: rgba(255,255,255,0.55);
  line-height: 1.7;
  margin-bottom: var(--cx-space-8);
}

.auth-panel__divider {
  width: 40px;
  height: 2px;
  background: var(--cx-primary);
  opacity: 0.4;
  margin-bottom: var(--cx-space-8);
}

.auth-panel__benefits {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-3);
}

.auth-panel__benefits li {
  font-size: var(--cx-text-sm);
  color: rgba(255,255,255,0.4);
  padding-left: var(--cx-space-5);
  position: relative;
}

.auth-panel__benefits li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cx-primary);
  opacity: 0.6;
}

/* ─── Área do formulário ─────────────────────────────────────────────────────── */
.auth-form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--cx-space-12) var(--cx-space-8);
}

.auth-form-wrap {
  width: 100%;
  max-width: 400px;
}

.auth-form-head {
  margin-bottom: var(--cx-space-8);
}

.auth-form-head h1 {
  font-size: var(--cx-text-2xl);
  font-weight: 800;
  color: var(--cx-text);
  letter-spacing: -0.03em;
  margin-bottom: var(--cx-space-2);
}

.auth-form-head p {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-muted);
  line-height: 1.6;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-5);
  margin-bottom: var(--cx-space-8);
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: var(--cx-space-2);
}

.auth-field label {
  font-size: var(--cx-text-sm);
  font-weight: 600;
  color: var(--cx-text-2);
  letter-spacing: 0.01em;
}

.auth-field input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--cx-border);
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-base);
  font-family: var(--cx-font-sans);
  color: var(--cx-text);
  background: var(--cx-surface);
  transition: border-color var(--cx-transition-fast), box-shadow var(--cx-transition-fast);
}

.auth-field input::placeholder {
  color: var(--cx-text-faint);
}

.auth-field input:hover {
  border-color: var(--cx-text-faint);
}

.auth-field input:focus {
  outline: none;
  border-color: var(--cx-primary);
  box-shadow: 0 0 0 3px var(--cx-primary-alpha);
}

.auth-submit {
  width: 100%;
  padding: 12px;
  background: var(--cx-primary);
  color: #fff;
  border: none;
  border-radius: var(--cx-radius-md);
  font-size: var(--cx-text-base);
  font-weight: 600;
  font-family: var(--cx-font-sans);
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background var(--cx-transition-base), box-shadow var(--cx-transition-base);
}

.auth-submit:hover {
  background: var(--cx-primary-dark);
  box-shadow: var(--cx-shadow-primary);
}

.auth-footer-text {
  font-size: var(--cx-text-sm);
  color: var(--cx-text-muted);
  text-align: center;
}

.auth-link {
  background: none;
  border: none;
  color: var(--cx-primary);
  font-size: inherit;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  margin-left: 4px;
  transition: color var(--cx-transition-fast);
}

.auth-link:hover {
  color: var(--cx-primary-dark);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-panel {
    display: none;
  }

  .auth-form-area {
    padding: var(--cx-space-8) var(--cx-space-5);
  }
}
</style>