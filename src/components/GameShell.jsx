import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineGame } from '../useOnlineGame';
import { translations } from '../i18n';
import History from './History';
import NameModal from './NameModal';
import OnlineModal from './OnlineModal';
import RulesModal from './RulesModal';
import { soundEngine } from '../games/toguz-korgool/sound';
import '../styles/game.css';

export default function GameShell({
  // Game identity
  lang,
  gameTranslations,  // { en: {...}, ru: {...}, de: {...} }
  gamePrefix,        // 'toguz' | 'mangala' | etc.

  // Game logic (pure functions)
  initialState,
  applyMove,
  aiChooseMove,
  pitOwner,
  totalStones,

  // Game config
  minStonesForMove = 1,

  // Render props — игра рисует свою доску
  renderBoard,       // ({ state, onPitClick, isClickable, animatingPits, landedPits }) => JSX
}) {
  const [state, setState] = useState(initialState());
  const [mode, setMode] = useState('ai');
  const [aiThinking, setAiThinking] = useState(false);
  const [animatingPits, setAnimatingPits] = useState([]);
  const [landedPits, setLandedPits] = useState([]);
  const [history, setHistory] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [names, setNames] = useState(['Player 1', 'Player 2']);
  const [showModal, setShowModal] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showOnline, setShowOnline] = useState(false);

  const t = translations[lang];
  const gt = gameTranslations[lang];

  const online = useOnlineGame(initialState, applyMove, gamePrefix);
  const prevOnlineState = useRef(null);

  const isOnline = mode === 'online' || online.onlineStatus === 'playing';
  const activeState = isOnline && online.gameState ? online.gameState : state;

  const name1 = mode === 'ai' ? t.you : isOnline ? online.myName : names[0];
  const name2 = mode === 'ai' ? t.ai : isOnline ? online.opponentName || '...' : names[1];

  const resetGame = useCallback((newNames) => {
    setState(initialState());
    setAiThinking(false);
    setAnimatingPits([]);
    setLandedPits([]);
    setHistory([]);
    if (newNames) setNames(newNames);
  }, [initialState]);

  const handleModalStart = useCallback((n1, n2) => {
    setNames([n1, n2]);
    setShowModal(false);
    resetGame();
  }, [resetGame]);

  const handleModeChange = useCallback((newMode) => {
    if (newMode === 'pvp') {
      setMode('pvp');
      setShowModal(true);
    } else if (newMode === 'online') {
      setShowOnline(true);
    } else {
      setMode('ai');
      resetGame();
    }
  }, [resetGame]);

  const handleMove = useCallback((pitIdx, currentState, n1, n2) => {
    if (currentState.gameOver) return null;

    const { newState, meta } = applyMove(currentState, pitIdx);

    setLandedPits([]);
    setAnimatingPits(meta.path || []);
    setLandedPits(meta.path || []);
    setTimeout(() => setAnimatingPits([]), 500);

    if (soundOn) {
      if (meta.newTuz) soundEngine.playTuz();
      else if (meta.captured > 0) soundEngine.playCapture();
      else soundEngine.playDrop();
    }
    if (soundOn && newState.gameOver) {
      setTimeout(() => soundEngine.playWin(), 300);
    }

    const pitLabel = meta.player === 0
      ? (pitIdx + 1)
      : pitOwner
        ? (pitOwner === 'function' ? (totalStones === 162 ? (18 - pitIdx) : (12 - pitIdx)) : pitIdx)
        : pitIdx;

    let capture = '';
    if (meta.newTuz) capture = t.tuzDeclared;
    else if (meta.captured > 0) capture = `+${meta.captured} ${t.toKazan}`;

    setHistory(h => [...h, {
      num: h.length + 1,
      player: meta.player,
      playerName: meta.player === 0 ? n1 : n2,
      pitLabel,
      capture,
    }]);

    setState(newState);
    return newState;
  }, [soundOn, t, applyMove, pitOwner, totalStones]);

  const handlePitClick = useCallback((pitIdx) => {
    if (isOnline) {
      if (online.playerSeat === null) return;
      if (pitOwner(pitIdx) !== online.playerSeat) return;
      if (online.gameState?.currentPlayer !== online.playerSeat) return;
      online.makeOnlineMove(pitIdx);
      return;
    }
    if (aiThinking || activeState.gameOver) return;
    if (pitOwner(pitIdx) !== activeState.currentPlayer) return;

    const newState = handleMove(pitIdx, activeState, name1, name2);
    if (newState && !newState.gameOver && mode === 'ai' && newState.currentPlayer === 1) {
      setAiThinking(true);
    }
  }, [activeState, aiThinking, mode, handleMove, name1, name2, online, isOnline, pitOwner]);

  // AI move
  useEffect(() => {
    if (!aiThinking || activeState.currentPlayer !== 1 || activeState.gameOver) return;
    const timer = setTimeout(() => {
      const best = aiChooseMove(activeState);
      if (best === -1) { setAiThinking(false); return; }
      const newState = handleMove(best, activeState, name1, name2);
      setAiThinking(false);
      if (newState && newState.gameOver) return;
    }, 700);
    return () => clearTimeout(timer);
  }, [aiThinking, activeState, handleMove, name1, name2, aiChooseMove]);

  // Online sync
  useEffect(() => {
    if (!isOnline || !online.gameState) return;
    const prev = prevOnlineState.current;
    const curr = online.gameState;
    prevOnlineState.current = curr;
    if (!prev) return;

    const movedPlayer = curr.currentPlayer === 0 ? 1 : 0;
    const movedName = movedPlayer === 0 ? name1 : name2;
    const captured = curr.kazans[movedPlayer] - prev.kazans[movedPlayer];

    if (soundOn) {
      if (curr.gameOver) soundEngine.playWin();
      else if (captured > 0) soundEngine.playCapture();
      else soundEngine.playDrop();
    }

    let pitLabel = '?';
    const pitsCount = curr.pits.length;
    for (let i = 0; i < pitsCount; i++) {
      if (pitOwner(i) === movedPlayer && prev.pits[i] > 0 && curr.pits[i] === 0) {
        pitLabel = movedPlayer === 0 ? (i + 1) : (pitsCount - i);
        break;
      }
    }

    let capture = '';
    if (captured > 0) capture = `+${captured} ${t.toKazan}`;

    setHistory(h => [...h, {
      num: h.length + 1,
      player: movedPlayer,
      playerName: movedName,
      pitLabel,
      capture,
    }]);
  }, [online.gameState, isOnline]);

  // Status
  let statusText = '';
  let statusClass = '';
  if (isOnline) {
    if (online.onlineStatus === 'waiting') {
      statusText = `Room: ${online.roomCode} — Waiting for opponent...`;
    } else if (online.gameState?.gameOver) {
      statusClass = 'win';
      const winner = online.gameState.winner;
      if (winner === 'draw') statusText = t.draw;
      else statusText = t.winPlayer(winner === online.playerSeat ? name1 : name2, online.gameState.kazans[0], online.gameState.kazans[1]);
    } else {
      const myTurn = online.gameState?.currentPlayer === online.playerSeat;
      statusText = myTurn ? t.turn1(name1) : t.turn2(name2);
    }
  } else if (activeState.gameOver) {
    statusClass = 'win';
    if (activeState.winner === 'draw') statusText = t.draw;
    else statusText = t.winPlayer(activeState.winner === 0 ? name1 : name2, activeState.kazans[0], activeState.kazans[1]);
  } else if (aiThinking) {
    statusText = t.turnAI;
  } else {
    statusText = activeState.currentPlayer === 0 ? t.turn1(name1) : t.turn2(name2);
  }

  const p1pct = Math.round((activeState.kazans[0] / totalStones) * 100);
  const p2pct = Math.round((activeState.kazans[1] / totalStones) * 100);

  const isClickable = (idx) => {
    if (isOnline) {
      return online.onlineStatus === 'playing' &&
        !online.gameState?.gameOver &&
        online.playerSeat === pitOwner(idx) &&
        online.gameState?.currentPlayer === online.playerSeat &&
        activeState.pits[idx] > 0;
    }
    return !activeState.gameOver &&
      !aiThinking &&
      activeState.currentPlayer === pitOwner(idx) &&
      (mode === 'pvp' || pitOwner(idx) === 0) &&
      activeState.pits[idx] >= minStonesForMove;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="ornament">— ✦ —</div>
        <h1>{gt.title}</h1>
        <p className="subtitle">{gt.subtitle}</p>
      </header>

      <div className="modeBar">
        <button className={`modeBtn ${mode === 'pvp' ? 'active' : ''}`} onClick={() => handleModeChange('pvp')}>
          {t.twoPlayers}
        </button>
        <button className={`modeBtn ${mode === 'ai' ? 'active' : ''}`} onClick={() => handleModeChange('ai')}>
          {t.vsAI}
        </button>
        <button className={`modeBtn ${isOnline ? 'active' : ''}`} onClick={() => handleModeChange('online')}>
          Online
        </button>
        <div className="rightControls">
          <button className="rulesBtn" onClick={() => setShowRules(true)}>{t.rules}</button>
          <button className={`soundBtn ${soundOn ? '' : 'muted'}`} onClick={() => setSoundOn(s => !s)}>
            {soundOn ? '♪' : '♩'}
          </button>
        </div>
      </div>

      <div className="scorePanel">
        <div className={`playerScore ${activeState.currentPlayer === 1 && !activeState.gameOver ? 'active' : ''} ${activeState.gameOver && activeState.winner === 1 ? 'winner' : ''}`}>
          <div className="playerName">{name2}</div>
          <div className="scoreVal">{activeState.kazans[1]}</div>
        </div>
        <div className="scoreSep">·</div>
        <div className={`playerScore ${activeState.currentPlayer === 0 && !activeState.gameOver ? 'active' : ''} ${activeState.gameOver && activeState.winner === 0 ? 'winner' : ''}`}>
          <div className="playerName">{name1}</div>
          <div className="scoreVal">{activeState.kazans[0]}</div>
        </div>
      </div>

      <div className="progressRow">
        <span className="progressLabel p2label">{p2pct}%</span>
        <div className="progressTrack">
          <div className="progressFill p2fill" style={{ width: p2pct + '%' }} />
        </div>
        <div className="progressDivider" />
        <div className="progressTrack">
          <div className="progressFill p1fill" style={{ width: p1pct + '%', marginLeft: 'auto' }} />
        </div>
        <span className="progressLabel p1label">{p1pct}%</span>
      </div>

      <div className={`statusBar ${statusClass}`}>{statusText}</div>

      <div className="gameLayout">
        <div className="boardWrap">
          <div className="board">
            {renderBoard({
              state: activeState,
              onPitClick: handlePitClick,
              isClickable,
              animatingPits,
              landedPits,
              name1,
              name2,
              t,
            })}
          </div>
        </div>
        <History moves={history} label={t.moveHistory} noMovesLabel={t.noMoves} />
      </div>

      <div className="bottomBar">
        {isOnline ? (
          <button className="btn" onClick={() => { online.leaveRoom(); setMode('ai'); }}>
            Leave Room
          </button>
        ) : (
          <button className="btn primary" onClick={() => mode === 'pvp' ? setShowModal(true) : resetGame()}>
            {t.newGame}
          </button>
        )}
      </div>

      {showModal && <NameModal t={t} onStart={handleModalStart} />}
      {showRules && (
        <RulesModal
          t={{ ...t, rulesTitle: gt.rulesTitle, rulesSteps: gt.rulesSteps, captions: gt.captions, captionCapture: gt.captionCapture, captionTuz: gt.captionTuz }}
          game={gamePrefix}
          onClose={() => setShowRules(false)}
        />
      )}
      {showOnline && (
        <OnlineModal
          t={t}
          onClose={() => setShowOnline(false)}
          onCreate={async (name) => {
            setMode('online');
            const code = await online.createRoom(name);
            setShowOnline(false);
            return code;
          }}
          onJoin={async (code, name) => {
            try {
              await online.joinRoom(code, name);
              setMode('online');
              setShowOnline(false);
            } catch(e) { throw e; }
          }}
        />
      )}
    </div>
  );
}