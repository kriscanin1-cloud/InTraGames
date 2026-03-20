import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/platform/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ToguzGame from './games/toguz-korgool/GamePage';
import MangalaGame from './games/mangala/GamePage';
import OwareGame from './games/oware/GamePage';

function Platform() {
  const [lang, setLang] = useState('en');

  return (
    <BrowserRouter basename="/InTraGames">
      <Navbar lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/" element={<Home lang={lang} />} />
        <Route path="/games" element={<Catalog lang={lang} />} />
        <Route path="/games/toguz-korgool" element={<ToguzGame lang={lang} />} />
        <Route path="/games/mangala" element={<MangalaGame lang={lang} />} />
        <Route path="/games/oware" element={<OwareGame lang={lang} />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Platform />
  </StrictMode>
);