import { useState } from 'react';
import styles from './NameModal.module.css';

export default function NameModal({ t, onStart }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  const handle = () => {
    onStart(
      name1.trim() || t.player1,
      name2.trim() || t.player2
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.ornament}>— ✦ —</div>
        <h2 className={styles.title}>{t.enterNames}</h2>
        <div className={styles.fields}>
          <div className={styles.field}>
            <div className={styles.dot} style={{background:'#c8963c'}} />
            <input
              className={styles.input}
              placeholder={t.namePlaceholder1}
              value={name1}
              onChange={e => setName1(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <div className={styles.dot} style={{background:'#6aacaa'}} />
            <input
              className={styles.input}
              placeholder={t.namePlaceholder2}
              value={name2}
              onChange={e => setName2(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
            />
          </div>
        </div>
        <button className={styles.btn} onClick={handle}>
          {t.startGame}
        </button>
      </div>
    </div>
  );
}