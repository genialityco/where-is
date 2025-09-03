import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from 'react-router-dom';
import './index.css';

import Register from './screens/Register';
import Play from './screens/Play';
import Ranking from './screens/Ranking';

const routes = [
  { path: '/', element: <Register /> },
  { path: '/play', element: <Play /> },
  { path: '/ranking', element: <Ranking /> },
];

// Usa HashRouter si abres dist/index.html con doble clic (file://)
// o si pones VITE_HASH_ROUTER=1 en tu .env del build
const useHash =
  window.location.protocol === 'file:' ||
  import.meta.env.VITE_HASH_ROUTER === '1';

const router = useHash ? createHashRouter(routes) : createBrowserRouter(routes);

// ✅ Evita el error de null
const container = document.getElementById('root');
if (!container) {
  throw new Error('No se encontró el elemento #root en index.html');
}
ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
