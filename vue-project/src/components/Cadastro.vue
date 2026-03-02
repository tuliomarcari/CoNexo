<template>
  <div class="auth-box">
    <div class="card">
      <h2>Criar Conta</h2>
      <form @submit.prevent="registrar">
        <input v-model="nome" type="text" placeholder="Nome Completo" required />
        <input v-model="email" type="email" placeholder="E-mail" required />
        <input v-model="senha" type="password" placeholder="Crie uma Senha" required />
        <button type="submit">Finalizar Cadastro</button>
      </form>
      <p>Já tem conta? <a @click="$emit('ir-para-login')">Voltar ao Login</a></p>
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
  const res = await fetch('http://localhost:3001/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: nome.value, email: email.value, senha: senha.value, tipo: 'cliente' })
  });
  if (res.ok) {
    alert("Conta criada! Agora faça login.");
    emit('ir-para-login');
  } else {
    alert("Erro ao cadastrar.");
  }
};
</script>

<style scoped>
.auth-box { display: flex; justify-content: center; padding-top: 100px; }
.card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); width: 350px; text-align: center; }
h2 { margin-bottom: 20px; color: #051614; }
input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; }
button { width: 100%; padding: 12px; background: #051614; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
p { margin-top: 15px; font-size: 0.9rem; }
a { color: #10b981; cursor: pointer; font-weight: bold; }
</style>