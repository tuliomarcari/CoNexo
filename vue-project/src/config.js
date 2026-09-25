// Configuração centralizada da URL da API Backend (Render / Local)
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    
    // Se a aplicação estiver hospedada em produção (ex: Vercel, Render) e VITE_API_URL for local ou indefinda, usa a URL do Render
    if (!isLocalhost && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return 'https://conexo-api.onrender.com';
    }
  }
  
  return envUrl || 'https://conexo-api.onrender.com';
};

export const API_URL = getApiUrl().replace(/\/$/, '');

