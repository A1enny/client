import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';  // ไฟล์หลักของ UI และ Routing

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
