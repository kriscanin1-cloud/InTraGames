import { useEffect, useRef } from 'react';
import styles from './History.module.css';

export default function History({ moves, label, noMovesLabel }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>{label}</div>
      <div className={styles.list} ref={listRef}>
        {moves.length === 0 ? (
          <div className={styles.empty}>{noMovesLabel}</div>
        ) : (
          moves.map((m, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.num}>{m.num}</span>
              <div className={`${styles.dot} ${m.player === 0 ? styles.p1 : styles.p2}`} />
              <div className={styles.text}>
                <div>{m.playerName} · {m.pitLabel}</div>
                {m.capture && <div className={styles.capture}>{m.capture}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}