<template>
  <div class="auth-box">
    <div class="card">
      <h2>Entrar no CoNexo</h2>
      <form @submit.prevent="entrar">
        <input v-model="email" type="email" placeholder="E-mail" required />
        <input v-model="senha" type="password" placeholder="Senha" required />
        <button type="submit">Acessar Conta</button>
      </form>
      <p>Não tem conta? <a @click="$emit('ir-para-cadastro')">Cadastre-se aqui</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const email = ref('');
const senha = ref('');
const emit = defineEmits(['logado', 'ir-para-cadastro']);

const entrar = async () => {
  const res = await fetch('https://conexo-api.onrender.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, senha: senha.value })
  });
  const dados = await res.json();
  if (res.ok) emit('logado', dados);
  else alert(dados.message);
};
</script>

<style scoped>
.auth-box { display: flex; justify-content: center; padding-top: 100px; }
.card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); width: 350px; text-align: center; }
h2 { margin-bottom: 20px; color: #051614; }
input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; }
button { width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
p { margin-top: 15px; font-size: 0.9rem; }
a { color: #10b981; cursor: pointer; font-weight: bold; }
</style>