
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Application: Mounting root...");

const rootElement = document.getElementById('root');
const loadingScreen = document.getElementById('loading-screen');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 使用 requestAnimationFrame 確保在首幀渲染後隱藏
    requestAnimationFrame(() => {
      console.log("Application: First frame rendered.");
      if (loadingScreen) {
        setTimeout(() => {
          loadingScreen.style.opacity = '0';
          setTimeout(() => loadingScreen.style.display = 'none', 500);
        }, 800);
      }
    });
  } catch (error: any) {
    console.error("Application: Mount failed", error);
    const errConsole = document.getElementById('error-console');
    if (errConsole) errConsole.innerText = "React Error: " + error.message;
  }
}
