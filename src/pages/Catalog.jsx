import { Link } from 'react-router-dom';
import { games } from '../games/registry';
import styles from './Catalog.module.css';

const catalogText = {
  en: {
    title: 'All Games',
    subtitle: 'Traditional intellectual games from around the world',
    available: 'Play Now',
    comingSoon: 'Coming Soon',
    players: 'Players',
    duration: 'Duration',
    difficulty: 'Difficulty',
    difficultyLabels: ['Easy', 'Medium', 'Hard'],
  },
  ru: {
    title: 'Все игры',
    subtitle: 'Традиционные интеллектуальные игры народов мира',
    available: 'Играть',
    comingSoon: 'Скоро',
    players: 'Игроки',
    duration: 'Время',
    difficulty: 'Сложность',
    difficultyLabels: ['Легко', 'Средне', 'Сложно'],
  },
  de: {
    title: 'Alle Spiele',
    subtitle: 'Traditionelle intellektuelle Spiele aus aller Welt',
    available: 'Spielen',
    comingSoon: 'Demnächst',
    players: 'Spieler',
    duration: 'Dauer',
    difficulty: 'Schwierigkeit',
    difficultyLabels: ['Leicht', 'Mittel', 'Schwer'],
  },
};

export default function Catalog({ lang }) {
  const t = catalogText[lang];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.ornament}>— ✦ —</div>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </div>

      <div className={styles.grid}>
        {games.map(g => {
          const name = lang === 'ru' ? g.titleRu : lang === 'de' ? g.titleDe : g.title;
          const origin = lang === 'ru' ? g.originRu : lang === 'de' ? g.originDe : g.origin;
          const desc = g.description[lang];

          return (
            <div key={g.slug} className={`${styles.card} ${!g.available ? styles.unavailable : ''}`}>
              <div className={styles.cardTop}>
                <div className={styles.origin}>{origin}</div>
                {!g.available && <div className={styles.badge}>{t.comingSoon}</div>}
              </div>
              <h2 className={styles.gameName}>{name}</h2>
              <p className={styles.desc}>{desc}</p>
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t.players}</span>
                  <span className={styles.metaVal}>{g.players}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t.duration}</span>
                  <span className={styles.metaVal}>{g.duration}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t.difficulty}</span>
                  <span className={styles.metaVal}>{t.difficultyLabels[g.difficulty - 1]}</span>
                </div>
              </div>
              <div className={styles.tags}>
                {g.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
              {g.available ? (
                <Link to={`/games/${g.slug}`} className={styles.playBtn}>
                  {t.available}
                </Link>
              ) : (
                <div className={styles.soonBtn}>{t.comingSoon}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}