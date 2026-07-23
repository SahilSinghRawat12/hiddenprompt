import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <BrowserRouter >
    <App />
    <Toaster position="top-right" // You can change this to 'bottom-center', 'top-center', etc.
      reverseOrder={false}/>
  </BrowserRouter>
  </StrictMode>,
)
