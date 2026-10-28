import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ActiveVehicleProvider } from './providers/ActiveVehicleProvider.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ActiveVehicleProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ActiveVehicleProvider>
    </ThemeProvider>
  </StrictMode>,
)
