import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import Register from './screens/Register';
import Play from './screens/Play';
import Ranking from './screens/Ranking';

const router = createBrowserRouter([
  { path: '/', element: <Register /> },
  { path: '/play', element: <Play /> },
  { path: '/ranking', element: <Ranking /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
