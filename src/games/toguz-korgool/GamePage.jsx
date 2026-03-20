import React from 'react';
import GameShell from '../../components/GameShell';
import { initialState, applyMove, aiChooseMove, pitOwner, TOTAL_STONES } from './logic';
import { toguzTranslations } from './i18n';
import Pit from '../../components/Pit';

function ToguzBoard({ state, onPitClick, isClickable, animatingPits, landedPits, name1, name2, t }) {
  return (
    <>
      <div className="kazanRow">
        <div className="kazan">
          <span className="kazanLabel">{t.kazanOf(name2)}</span>
          <span className="kazanVal">{state.kazans[1]}</span>
        </div>
        <div className="kazanLine" />
        <div className="kazan">
          <span className="kazanLabel">{t.kazanOf(name1)}</span>
          <span className="kazanVal">{state.kazans[0]}</span>
        </div>
      </div>

      <div className="pitRow">
        {Array.from({ length: 9 }, (_, i) => 17 - i).map(idx => (
          <Pit key={idx} count={state.pits[idx]} index={idx} playerOwner={1}
            clickable={isClickable(idx)}
            tuz={state.tuz[0] === idx || state.tuz[1] === idx}
            tuzOwner={state.tuz[0] === idx ? 0 : 1}
            tuzLabel={state.tuz[0] === idx ? 'И1' : 'И2'}
            animating={animatingPits.includes(idx)}
            landed={landedPits.includes(idx)}
            onClick={() => onPitClick(idx)} />
        ))}
      </div>

      <div className="boardDivider" />

      <div className="pitRow">
        {Array.from({ length: 9 }, (_, i) => i).map(idx => (
          <Pit key={idx} count={state.pits[idx]} index={idx} playerOwner={0}
            clickable={isClickable(idx)}
            tuz={state.tuz[0] === idx || state.tuz[1] === idx}
            tuzOwner={state.tuz[0] === idx ? 0 : 1}
            tuzLabel={state.tuz[0] === idx ? 'И1' : 'И2'}
            animating={animatingPits.includes(idx)}
            landed={landedPits.includes(idx)}
            onClick={() => onPitClick(idx)} />
        ))}
      </div>
    </>
  );
}

export default function ToguzGame({ lang = 'en' }) {
  return (
    <GameShell
      lang={lang}
      gameTranslations={toguzTranslations}
      gamePrefix="toguz"
      initialState={initialState}
      applyMove={applyMove}
      aiChooseMove={aiChooseMove}
      pitOwner={pitOwner}
      totalStones={TOTAL_STONES}
      renderBoard={(props) => <ToguzBoard {...props} />}
    />
  );
}