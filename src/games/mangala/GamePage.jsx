import React from 'react';
import GameShell from '../../components/GameShell';
import { initialState, applyMove, aiChooseMove, pitOwner, TOTAL_STONES } from './logic';
import { mangalaTranslations } from './i18n';
import Pit from '../../components/Pit';

function MangalaBoard({ state, onPitClick, isClickable, animatingPits, landedPits, name1, name2, t }) {
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
        {Array.from({ length: 6 }, (_, i) => 11 - i).map(idx => (
          <Pit key={idx} count={state.pits[idx]} index={idx} playerOwner={1}
            clickable={isClickable(idx)}
            tuz={false} tuzOwner={0} tuzLabel=""
            animating={animatingPits.includes(idx)}
            landed={landedPits.includes(idx)}
            onClick={() => onPitClick(idx)} />
        ))}
      </div>

      <div className="boardDivider" />

      <div className="pitRow">
        {Array.from({ length: 6 }, (_, i) => i).map(idx => (
          <Pit key={idx} count={state.pits[idx]} index={idx} playerOwner={0}
            clickable={isClickable(idx)}
            tuz={false} tuzOwner={0} tuzLabel=""
            animating={animatingPits.includes(idx)}
            landed={landedPits.includes(idx)}
            onClick={() => onPitClick(idx)} />
        ))}
      </div>
    </>
  );
}

export default function MangalaGame({ lang = 'en' }) {
  return (
    <GameShell
      lang={lang}
      gameTranslations={mangalaTranslations}
      gamePrefix="mangala"
      initialState={initialState}
      applyMove={applyMove}
      aiChooseMove={aiChooseMove}
      pitOwner={pitOwner}
      totalStones={TOTAL_STONES}
      renderBoard={(props) => <MangalaBoard {...props} />}
      minStonesForMove={2}
    />
  );
}