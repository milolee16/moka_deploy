<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
=======
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
>>>>>>> 0b8225ee88dd3d666438cf373d23808c00af3c1b
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById('root')).render(
<<<<<<< HEAD
  <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
  </StrictMode>,
=======
    <StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StrictMode>,
>>>>>>> 0b8225ee88dd3d666438cf373d23808c00af3c1b
)

