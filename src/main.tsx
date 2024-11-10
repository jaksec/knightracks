import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App'; // Import App instead of Home

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App /> {/* Render App instead of Home */}
  </StrictMode>
);