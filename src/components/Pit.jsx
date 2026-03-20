import { useEffect, useRef } from 'react';
import styles from './Pit.module.css';

export default function Pit({ count, index, playerOwner, clickable, tuz, tuzOwner, tuzLabel, animating, landed, onClick }) {
  const ref = useRef(null);

  useEffect(() => {
    if (animating && ref.current) {
      ref.current.classList.remove(styles.pulse);
      void ref.current.offsetWidth;
      ref.current.classList.add(styles.pulse);
      const t = setTimeout(() => ref.current?.classList.remove(styles.pulse), 400);
      return () => clearTimeout(t);
    }
  }, [animating]);

  const label = playerOwner === 0 ? (index + 1) : (18 - index);

  const cls = [
    styles.pit,
    clickable ? styles.clickable : styles.inactive,
    tuz ? styles.tuz : '',
    count === 0 ? styles.empty : '',
    landed && !tuz ? styles.landed : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} ref={ref} onClick={clickable ? onClick : undefined}>
      {tuz && (
        <div className={styles.tuzBadge}>{tuzLabel}</div>
      )}
      <span className={styles.count}>{count}</span>
      <span className={styles.idx}>{label}</span>
    </div>
  );
}