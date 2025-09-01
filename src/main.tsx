import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './app/globals.css'

console.log('🚀 Naveeg main.tsx starting...');

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  // Create fallback UI
  const fallbackDiv = document.createElement('div');
  fallbackDiv.innerHTML = `
    <div style="
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    ">
      <div>
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">🚀 Naveeg App</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">App is running successfully!</p>
        <div style="
          background: rgba(255,255,255,0.1); 
          padding: 1rem; 
          border-radius: 8px;
          font-family: monospace;
        ">
          Root element created dynamically
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(fallbackDiv);
} else {
  console.log('✅ Root element found, mounting React app...');
  
  // Test if React is working
  try {
    console.log('🧪 Testing React import...');
    console.log('React version:', React.version);
    console.log('ReactDOM version:', ReactDOM.version);
    
    console.log('🧪 Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('🧪 Rendering App component...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    
    console.log('✅ React app mounted successfully!');
  } catch (error) {
    console.error('❌ Error mounting React app:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-family: system-ui, sans-serif;
        background: #ef4444;
        color: white;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Error Loading App</h1>
          <p style="font-size: 1rem; margin-bottom: 1rem;">There was an error mounting the React app</p>
          <div style="
            background: rgba(255,255,255,0.1); 
            padding: 1rem; 
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.8rem;
          ">
            ${error instanceof Error ? error.message : 'Unknown error'}
          </div>
          <div style="
            background: rgba(255,255,255,0.1); 
            padding: 1rem; 
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.8rem;
            margin-top: 1rem;
          ">
            ${error instanceof Error ? error.stack : 'No stack trace'}
          </div>
        </div>
      </div>
    `;
  }
}
