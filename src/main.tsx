import React from 'react'
import ReactDOM from 'react-dom/client'
import GlobalStyles from './GlobalStyles'
import App from './App'
import './style.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <BrowserRouter>
      <GlobalStyles />
      <App />
    </BrowserRouter>
)
