import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <-- 1. Tải "bộ da" Tailwind
import './App.css'   // <-- 2. Tải CSS tùy chỉnh (in ấn)
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
  </StrictMode>,
)