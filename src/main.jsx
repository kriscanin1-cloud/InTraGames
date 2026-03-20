import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/platform/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import App from './App';
import './App.css';

function Platform() {
  const [lang, setLang] = useState('en');

  return (
        <BrowserRouter basename="/InTraGames">
      <Navbar lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/" element={<Home lang={lang} />} />
        <Route path="/games" element={<Catalog lang={lang} />} />
        <Route path="/games/toguz-korgool" element={<App lang={lang} />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Platform />
  </StrictMode>
);