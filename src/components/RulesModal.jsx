import { useState } from 'react';
import styles from './RulesModal.module.css';

function ToguzBoard({ step, t }) {
  if (step === 0) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {Array(9).fill(9).map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {Array(9).fill(9).map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[0]}</div>
    </div>
  );

  if (step === 1) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {[9,9,9,9,9,9,9,9,9].map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {[9,9,9,9,9,9,10,10,0].map((n, i) => (
            <div key={i} className={`${styles.visualPit} ${i === 8 ? styles.source : ''} ${i >= 6 && i <= 7 ? styles.landed : ''}`}>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[1]}</div>
    </div>
  );

  if (step === 2) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {[9,9,9,9,9,9,9,8,9].map((n, i) => (
            <div key={i} className={`${styles.visualPit} ${i === 7 ? styles.capture : ''}`}>
              <span>{n}</span>
              {i === 7 && <div className={styles.pitNote}>{t.captionCapture}</div>}
            </div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {[9,9,9,9,9,9,9,9,9].map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[2]}</div>
    </div>
  );

  if (step === 3) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {[9,9,9,9,9,9,9,3,9].map((n, i) => (
            <div key={i} className={`${styles.visualPit} ${i === 7 ? styles.tuzPit : ''}`}>
              <span>{n}</span>
              {i === 7 && <div className={styles.tuzNote}>{t.captionTuz}</div>}
            </div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {[9,9,9,9,9,9,9,9,9].map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[3]}</div>
    </div>
  );

  if (step === 4) return (
    <div className={styles.visual}>
      <div className={styles.scoreVisual}>
        <div className={styles.scoreBox} style={{borderColor:'#c8963c'}}>
          <div className={styles.scoreNum} style={{color:'#c8963c'}}>92</div>
          <div className={styles.scoreLabel}>Player 1 🏆</div>
        </div>
        <div className={styles.scoreSep}>vs</div>
        <div className={styles.scoreBox}>
          <div className={styles.scoreNum}>70</div>
          <div className={styles.scoreLabel}>Player 2</div>
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[4]}</div>
    </div>
  );

  return null;
}

function MangalaBoard({ step, t }) {
  if (step === 0) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {Array(6).fill(4).map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {Array(6).fill(4).map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[0]}</div>
    </div>
  );

  if (step === 1) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {[4,4,4,4,4,4].map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {[1,5,5,5,4,4].map((n, i) => (
            <div key={i} className={`${styles.visualPit} ${i === 0 ? styles.source : ''} ${i >= 1 && i <= 3 ? styles.landed : ''}`}>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[1]}</div>
    </div>
  );

  if (step === 2) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {[4,4,4,2,4,4].map((n, i) => (
            <div key={i} className={`${styles.visualPit} ${i === 3 ? styles.capture : ''}`}>
              <span>{n}</span>
              {i === 3 && <div className={styles.pitNote}>{t.captionCapture}</div>}
            </div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {[4,4,4,4,4,4].map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[2]}</div>
    </div>
  );

  if (step === 3) return (
    <div className={styles.visual}>
      <div className={styles.visualBoard}>
        <div className={styles.visualRow}>
          {[4,4,2,2,4,4].map((n, i) => (
            <div key={i} className={`${styles.visualPit} ${i === 2 || i === 3 ? styles.capture : ''}`}>
              <span>{n}</span>
              {i === 3 && <div className={styles.pitNote}>{t.captionCapture}</div>}
              {i === 2 && <div className={styles.pitNote}>{t.captionCapture}</div>}
            </div>
          ))}
        </div>
        <div className={styles.visualDivider} />
        <div className={styles.visualRow}>
          {[4,4,4,4,4,4].map((n, i) => (
            <div key={i} className={styles.visualPit}><span>{n}</span></div>
          ))}
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[3]}</div>
    </div>
  );

  if (step === 4) return (
    <div className={styles.visual}>
      <div className={styles.scoreVisual}>
        <div className={styles.scoreBox} style={{borderColor:'#c8963c'}}>
          <div className={styles.scoreNum} style={{color:'#c8963c'}}>28</div>
          <div className={styles.scoreLabel}>Player 1 🏆</div>
        </div>
        <div className={styles.scoreSep}>vs</div>
        <div className={styles.scoreBox}>
          <div className={styles.scoreNum}>20</div>
          <div className={styles.scoreLabel}>Player 2</div>
        </div>
      </div>
      <div className={styles.visualCaption}>{t.captions[4]}</div>
    </div>
  );

  return null;
}

export default function RulesModal({ t, game, onClose }) {
  const [step, setStep] = useState(0);
  const total = t.rulesSteps.length;
  const current = t.rulesSteps[step];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.ornament}>— ✦ —</div>
        <h2 className={styles.title}>{t.rulesTitle}</h2>

        <div className={styles.stepIndicator}>
          {Array(total).fill(0).map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === step ? styles.activeDot : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        {game === 'mangala'
          ? <MangalaBoard step={step} t={t} />
          : <ToguzBoard step={step} t={t} />
        }

        <div className={styles.stepContent}>
          <div className={styles.stepCounter}>{t.stepOf(step + 1, total)}</div>
          <h3 className={styles.stepTitle}>{current.title}</h3>
          <p className={styles.stepText}>{current.text}</p>
        </div>

        <div className={styles.nav}>
          <button
            className={`${styles.navBtn} ${step === 0 ? styles.hidden : ''}`}
            onClick={() => setStep(s => s - 1)}
          >
            ← {t.prev}
          </button>
          <button
            className={styles.navBtn}
            onClick={() => step === total - 1 ? onClose() : setStep(s => s + 1)}
          >
            {step === total - 1 ? t.close : `${t.next} →`}
          </button>
        </div>
      </div>
    </div>
  );
}