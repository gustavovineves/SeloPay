import axios from 'axios';

// ─── CONFIGURAÇÃO DA URL DA API ───────────────────────────────────────────────
// Altere APENAS esta constante para mudar onde o app se conecta:
//
//   Dispositivo físico (WiFi):  'http://SEU_IP_LOCAL:3333/api'
//                                Ex: 'http://192.168.0.135:3333/api'
//
//   Android Emulator (AVD):     'http://10.0.2.2:3333/api'
//   iOS Simulator:              'http://localhost:3333/api'
//   Expo Go no dispositivo:     'http://SEU_IP_LOCAL:3333/api'
//
// Para descobrir seu IP local no Windows: ipconfig | buscar "IPv4"
// ─────────────────────────────────────────────────────────────────────────────
export const API_BASE_URL = 'http://192.168.0.135:3333/api';

// ─── API de usuários comuns ───────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let _onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(fn: () => void): void {
  _onUnauthorized = fn;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Tempo limite de conexão excedido'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Sem conexão com o servidor. Verifique se a API está rodando.'));
    }
    if (error.response.status === 401) {
      // Só redireciona se há uma sessão ativa — não durante tentativas de login
      if (api.defaults.headers.common['Authorization']) {
        delete api.defaults.headers.common['Authorization'];
        _onUnauthorized?.();
        return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
      }
      const raw = error.response?.data?.message;
      const message = Array.isArray(raw) ? raw[0] : (raw ?? 'E-mail ou senha inválidos.');
      return Promise.reject(new Error(message));
    }
    const raw = error.response?.data?.message;
    const message = Array.isArray(raw) ? raw[0] : (raw ?? 'Erro desconhecido');
    return Promise.reject(new Error(message));
  },
);

// ─── API exclusiva para o painel admin ───────────────────────────────────────
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let _onAdminUnauthorized: (() => void) | null = null;

export function registerAdminUnauthorizedHandler(fn: () => void): void {
  _onAdminUnauthorized = fn;
}

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Tempo limite de conexão excedido'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Sem conexão com o servidor. Verifique se a API está rodando.'));
    }
    if (error.response.status === 401) {
      if (adminApi.defaults.headers.common['Authorization']) {
        delete adminApi.defaults.headers.common['Authorization'];
        _onAdminUnauthorized?.();
        return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
      }
      const raw = error.response?.data?.message;
      const message = Array.isArray(raw) ? raw[0] : (raw ?? 'E-mail ou senha inválidos.');
      return Promise.reject(new Error(message));
    }
    const raw = error.response?.data?.message;
    const message = Array.isArray(raw) ? raw[0] : (raw ?? 'Erro desconhecido');
    return Promise.reject(new Error(message));
  },
);
