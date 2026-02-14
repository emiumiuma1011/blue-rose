
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("React App: Starting initialization...");

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
    // 渲染成功後移除加載提示
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
    console.log("React App: Render called successfully.");
  } catch (error) {
    console.error("React App: Critical error during mount:", error);
    const errConsole = document.getElementById('error-console');
    if (errConsole) errConsole.innerText = "Mount Error: " + error.message;
  }
}
