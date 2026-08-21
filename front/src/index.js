// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // ይህን መስመር ጨምር

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ይህን መስመር ጨምር */}
      <App />
    </BrowserRouter> {/* ይህን መስመር ጨምር */}
  </React.StrictMode>
);
