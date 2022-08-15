import React from 'react'
import ReactDOM from 'react-dom/client'
import GlobalStyles from './GlobalStyles'
import App from './App'
import './style.css'
import { BrowserRouter } from 'react-router-dom'
import SupabaseProvider from './contexts/SupabaseContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <SupabaseProvider>
      <GlobalStyles />
      <App />
    </SupabaseProvider>
  </BrowserRouter>
)
