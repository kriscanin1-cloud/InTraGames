import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar({ lang, setLang }) {
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIn}>In</span>Tra
        <span className={styles.logoGames}>Games</span>
      </Link>

      <div className={styles.links}>
        <Link to="/" className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}>
          Home
        </Link>
        <Link to="/games" className={`${styles.link} ${location.pathname.startsWith('/games') ? styles.active : ''}`}>
          Games
        </Link>
      </div>

      <div className={styles.langBar}>
        {['en', 'ru', 'de'].map(l => (
          <button
            key={l}
            className={`${styles.langBtn} ${lang === l ? styles.activeLang : ''}`}
            onClick={() => setLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}