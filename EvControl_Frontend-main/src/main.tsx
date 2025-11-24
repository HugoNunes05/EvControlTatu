import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  createBrowserRouter, 
  RouterProvider 
} from 'react-router-dom';

import App from './App.tsx';
import Login from './components/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import './index.css';

// --- INÍCIO DA CONFIGURAÇÃO DO AXIOS ---
import axios from 'axios';

// 1. Interceptor de Requisição (Envia o token)
axios.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage CADA VEZ que uma requisição é feita
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Adiciona o cabeçalho 'Authorization' com o token Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor de Resposta (Lida com token expirado)
// (Isso é uma boa prática para deslogar o usuário se o token expirar)
axios.interceptors.response.use(
  (response) => response, // Se a resposta for boa, não faz nada
  (error) => {
    // Se o erro for 401 (Não Autorizado) ou 403 (Proibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken'); // Limpa o token inválido
      // Redireciona o usuário de volta para a tela de login
      window.location.href = '/login'; 
      alert('Sua sessão expirou. Por favor, faça login novamente.');
    }
    return Promise.reject(error);
  }
);
// --- FIM DA CONFIGURAÇÃO DO AXIOS ---


// 2. Definição das Rotas
const router = createBrowserRouter([
  {
    path: '/login', // Rota pública
    element: <Login />,
  },
  {
    path: '/', // Rota principal
    element: <ProtectedRoute />, // Protegida!
    children: [
      {
        path: '/', // O elemento "filho" que será renderizado
        element: <App />, // Seu sistema EvControl!
      },
      // (Você pode adicionar mais rotas protegidas aqui, ex: /perfil)
    ],
  },
]);

// 3. Renderização do Router
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);