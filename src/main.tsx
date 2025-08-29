import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/cacheBreaker' // Initialize cache breaking on app start

createRoot(document.getElementById("root")!).render(<App />);
