<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Cadastre-se no CoNexo</h2>
      <p class="subtitle">Crie sua conta para publicar projetos e ideias.</p>
      
      <form @submit.prevent="registrar">
        <div class="input-group">
          <input v-model="nome" type="text" placeholder="Nome Completo" required />
        </div>
        <div class="input-group">
          <input v-model="email" type="email" placeholder="Seu melhor e-mail" required />
        </div>
        <div class="input-group">
          <input v-model="senha" type="password" placeholder="Crie uma senha forte" required />
        </div>
        
        <button type="submit" class="btn-primary">Finalizar Cadastro</button>
      </form>
      
      <p class="footer-text">
        Já tem uma conta? 
        <a @click="$emit('ir-para-login')">Entrar agora</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const nome = ref('');
const email = ref('');
const senha = ref('');
const emit = defineEmits(['ir-para-login']);

const registrar = async () => {
  try {
    const res = await fetch('https://conexo-api.onrender.com/cadastro', {
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
      alert(erro.mensagem || "Erro ao realizar cadastro.");
    }
  } catch (error) {
    alert("Erro de conexão com o servidor.");
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 70px);
  background-color: #f8fafc;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 { color: #0f172a; margin-bottom: 8px; font-weight: 700; }
.subtitle { color: #64748b; margin-bottom: 30px; font-size: 0.95rem; }

.input-group { margin-bottom: 15px; }

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;
}

.btn-primary:hover { background-color: #059669; }

.footer-text { margin-top: 20px; color: #64748b; font-size: 0.9rem; }
.footer-text a { color: #10b981; font-weight: 600; cursor: pointer; text-decoration: none; }
.footer-text a:hover { text-decoration: underline; }
</style>