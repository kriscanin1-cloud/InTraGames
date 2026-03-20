import { Link } from 'react-router-dom';
import { games } from '../games/registry';
import styles from './Home.module.css';

const homeText = {
  en: {
    tagline: 'Traditional Strategy Games',
    sub: 'Discover and play intellectual games from cultures around the world — preserved, reimagined, and brought online.',
    cta: 'Browse Games',
    featuredTitle: 'Featured Game',
    comingSoon: 'More games coming soon',
    stats: [
      { num: '4+', label: 'Games' },
      { num: '3', label: 'Languages' },
      { num: '∞', label: 'Cultures' },
    ],
  },
  ru: {
    tagline: 'Традиционные стратегические игры',
    sub: 'Открывай и играй в интеллектуальные игры народов мира — сохранённые, переосмысленные и доступные онлайн.',
    cta: 'Смотреть игры',
    featuredTitle: 'Игра недели',
    comingSoon: 'Скоро новые игры',
    stats: [
      { num: '4+', label: 'Игры' },
      { num: '3', label: 'Языка' },
      { num: '∞', label: 'Культур' },
    ],
  },
  de: {
    tagline: 'Traditionelle Strategiespiele',
    sub: 'Entdecke und spiele intellektuelle Spiele aus Kulturen der ganzen Welt — bewahrt, neu gedacht und online.',
    cta: 'Spiele entdecken',
    featuredTitle: 'Empfohlenes Spiel',
    comingSoon: 'Weitere Spiele kommen bald',
    stats: [
      { num: '4+', label: 'Spiele' },
      { num: '3', label: 'Sprachen' },
      { num: '∞', label: 'Kulturen' },
    ],
  },
};

export default function Home({ lang }) {
  const t = homeText[lang];
  const featured = games.find(g => g.available);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOrnament}>— ✦ —</div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroIn}>In</span>Tra
          <span className={styles.heroGames}>Games</span>
        </h1>
        <p className={styles.heroTagline}>{t.tagline}</p>
        <p className={styles.heroSub}>{t.sub}</p>
        <Link to="/games" className={styles.heroCta}>{t.cta}</Link>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        {t.stats.map((s, i) => (
          <div key={i} className={styles.stat}>
            <div className={styles.statNum}>{s.num}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Featured game */}
      {featured && (
        <section className={styles.featured}>
          <div className={styles.featuredLabel}>{t.featuredTitle}</div>
          <div className={styles.featuredCard}>
            <div className={styles.featuredLeft}>
              <div className={styles.featuredOrigin}>
                {lang === 'ru' ? featured.originRu : lang === 'de' ? featured.originDe : featured.origin}
              </div>
              <h2 className={styles.featuredTitle}>
                {lang === 'ru' ? featured.titleRu : lang === 'de' ? featured.titleDe : featured.title}
              </h2>
              <p className={styles.featuredDesc}>{featured.description[lang]}</p>
              <div className={styles.featuredMeta}>
                <span>👥 {featured.players}</span>
                <span>⏱ {featured.duration}</span>
                <span>{'★'.repeat(featured.difficulty)}{'☆'.repeat(3 - featured.difficulty)}</span>
              </div>
              <Link to={`/games/${featured.slug}`} className={styles.featuredBtn}>
                {lang === 'ru' ? 'Играть' : lang === 'de' ? 'Spielen' : 'Play Now'}
              </Link>
            </div>
            <div className={styles.featuredRight}>
              <div className={styles.miniBoard}>
                {Array(18).fill(9).map((n, i) => (
                  <div key={i} className={`${styles.miniPit} ${i < 9 ? styles.miniTop : styles.miniBottom}`}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Coming soon */}
      <section className={styles.comingSoon}>
        <div className={styles.comingSoonLabel}>{t.comingSoon}</div>
        <div className={styles.comingSoonGrid}>
          {games.filter(g => !g.available).map(g => (
            <div key={g.slug} className={styles.comingSoonCard}>
              <div className={styles.comingSoonTitle}>
                {lang === 'ru' ? g.titleRu : lang === 'de' ? g.titleDe : g.title}
              </div>
              <div className={styles.comingSoonOrigin}>
                {lang === 'ru' ? g.originRu : lang === 'de' ? g.originDe : g.origin}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}