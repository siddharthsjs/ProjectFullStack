import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BankingDataProvider } from './context/BankingDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BankingDataProvider>
          <App />
        </BankingDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
