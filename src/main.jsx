import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { installExternalDomMutationGuard } from './utils/externalDomMutationGuard.js';

installExternalDomMutationGuard();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
