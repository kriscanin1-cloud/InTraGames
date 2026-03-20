import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initialState, applyMove, aiChooseMove, pitOwner, TOTAL_STONES } from './logic';
import { soundEngine } from './sound';
import { translations } from '../../i18n';
import { toguzTranslations } from './i18n';
import { useOnlineGame } from '../../useOnlineGame';
import Pit from '../../components/Pit';
import History from '../../components/History';
import NameModal from '../../components/NameModal';
import RulesModal from '../../components/RulesModal';
import OnlineModal from '../../components/OnlineModal';
import './App.css';

export default function App({ lang = 'en' }) {
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
  const tt = toguzTranslations[lang];
  const online = useOnlineGame(initialState, applyMove, 'toguz');

  const activeState = mode === 'online' && online.gameState ? online.gameState : state;

  const name1 = mode === 'ai' ? t.you : mode === 'online' ? online.myName : names[0];
  const name2 = mode === 'ai' ? t.ai : mode === 'online' ? online.opponentName || '...' : names[1];

  const resetGame = useCallback((newNames) => {
    setState(initialState());
    setAiThinking(false);
    setAnimatingPits([]);
    setHistory([]);
    if (newNames) setNames(newNames);
  }, []);

  const handleModalStart = useCallback((n1, n2) => {
    setNames([n1, n2]);
    setShowModal(false);
    setState(initialState());
    setAiThinking(false);
    setAnimatingPits([]);
    setHistory([]);
  }, []);

  const handleModeChange = useCallback((newMode) => {
    if (newMode === 'pvp') {
      setMode('pvp');
      setShowModal(true);
    } else if (newMode === 'online') {
      setShowOnline(true);
      // НЕ меняем mode здесь — поменяем после успешного подключения
    } else {
      setMode('ai');
      setNames([t.you, t.ai]);
      resetGame();
    }
  }, [t, resetGame]);

  const handleMove = useCallback((pitIdx, currentState, n1, n2) => {
    if (currentState.gameOver) return null;
    if (currentState.pits[pitIdx] === 0) return null;

    setLandedPits([]);
    const { newState, meta } = applyMove(currentState, pitIdx);

    setAnimatingPits(meta.path);
    setLandedPits(meta.path);
    setTimeout(() => setAnimatingPits([]), 500);

    if (soundOn) {
      if (meta.newTuz) soundEngine.playTuz();
      else if (meta.captured > 0) soundEngine.playCapture();
      else soundEngine.playDrop();
    }
    if (soundOn && newState.gameOver) {
      setTimeout(() => soundEngine.playWin(), 300);
    }

    const pitLabel = meta.player === 0 ? (pitIdx + 1) : (18 - pitIdx);
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
  }, [soundOn, t]);

  const handlePitClick = useCallback((pitIdx) => {
    if (mode === 'online') {
      if (online.playerSeat === null) return;
      if (pitOwner(pitIdx) !== online.playerSeat) return;
      if (online.gameState?.currentPlayer !== online.playerSeat) return;
      online.makeOnlineMove(pitIdx);
      return;
    }
    if (aiThinking || activeState.gameOver) return;
    if (pitOwner(pitIdx) !== activeState.currentPlayer) return;
    if (activeState.pits[pitIdx] === 0) return;

    const newState = handleMove(pitIdx, activeState, name1, name2);
    if (newState && !newState.gameOver && mode === 'ai' && newState.currentPlayer === 1) {
      setAiThinking(true);
    }
  }, [activeState, aiThinking, mode, handleMove, name1, name2, online]);

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
  }, [aiThinking, activeState, handleMove, name1, name2]);

  // Online state sounds
  const prevOnlineState = React.useRef(null);

  useEffect(() => {
    if (mode !== 'online' || !online.gameState) return;
    const prev = prevOnlineState.current;
    const curr = online.gameState;
    prevOnlineState.current = curr;
    if (!prev) return;

    // Determine what changed
    const prevTotal = prev.pits.reduce((a, b) => a + b, 0) + prev.kazans[0] + prev.kazans[1];
    const currTotal = curr.pits.reduce((a, b) => a + b, 0) + curr.kazans[0] + curr.kazans[1];

    // Find which player just moved (currentPlayer flipped)
    const movedPlayer = curr.currentPlayer === 0 ? 1 : 0;
    const movedName = movedPlayer === 0 ? name1 : name2;

    // Detect capture
    const captured = curr.kazans[movedPlayer] - prev.kazans[movedPlayer];
    const newTuz = curr.tuz[movedPlayer] !== prev.tuz[movedPlayer];

    // Sound
    if (soundOn) {
      if (curr.gameOver) soundEngine.playWin();
      else if (newTuz) soundEngine.playTuz();
      else if (captured > 0) soundEngine.playCapture();
      else soundEngine.playDrop();
    }

    // Find which pit was played (became 0 or decreased significantly)
    let pitLabel = '?';
    for (let i = 0; i < 18; i++) {
      if (pitOwner(i) === movedPlayer && prev.pits[i] > 0 && curr.pits[i] === 0) {
        pitLabel = movedPlayer === 0 ? (i + 1) : (18 - i);
        break;
      }
    }

    // History
    let capture = '';
    if (newTuz) capture = t.tuzDeclared;
    else if (captured > 0) capture = `+${captured} ${t.toKazan}`;

    setHistory(h => [...h, {
      num: h.length + 1,
      player: movedPlayer,
      playerName: movedName,
      pitLabel,
      capture,
    }]);

  }, [online.gameState, mode]);

  let statusText = '';
  let statusClass = '';

  if (mode === 'online') {
    if (online.onlineStatus === 'waiting') {
      statusText = `Room: ${online.roomCode} — Waiting for opponent...`;
    } else if (online.onlineStatus === 'playing') {
      if (online.gameState?.gameOver) {
        statusClass = 'win';
        const winner = online.gameState.winner;
        if (winner === 'draw') statusText = t.draw;
        else statusText = t.winPlayer(winner === online.playerSeat ? name1 : name2, online.gameState.kazans[0], online.gameState.kazans[1]);
      } else {
        const myTurn = online.gameState?.currentPlayer === online.playerSeat;
        statusText = myTurn ? t.turn1(name1) : t.turn2(name2);
      }
    } else {
      statusText = 'Connecting...';
    }
  } else if (activeState.gameOver) {
    statusClass = 'win';
    if (activeState.winner === 'draw') statusText = t.draw;
    else {
      const winName = activeState.winner === 0 ? name1 : name2;
      statusText = t.winPlayer(winName, activeState.kazans[0], activeState.kazans[1]);
    }
  } else if (aiThinking) {
    statusText = t.turnAI;
  } else {
    statusText = activeState.currentPlayer === 0 ? t.turn1(name1) : t.turn2(name2);
  }

  const p1pct = Math.round((activeState.kazans[0] / TOTAL_STONES) * 100);
  const p2pct = Math.round((activeState.kazans[1] / TOTAL_STONES) * 100);

  const isMyPitClickable = (idx) => {
    if (mode === 'online') {
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
      activeState.pits[idx] > 0;
  };

  return (
    <div className="appWrapper">
      <div className="app">
        <header className="header">
          <div className="ornament">— ✦ —</div>
          <h1>{tt.title}</h1>
        <p className="subtitle">{tt.subtitle}</p>
        </header>

        <div className="modeBar">
          <button className={`modeBtn ${mode === 'pvp' ? 'active' : ''}`} onClick={() => handleModeChange('pvp')}>
            {t.twoPlayers}
          </button>
          <button className={`modeBtn ${mode === 'ai' ? 'active' : ''}`} onClick={() => handleModeChange('ai')}>
            {t.vsAI}
          </button>
          <button className={`modeBtn ${mode === 'online' ? 'active' : ''}`} onClick={() => handleModeChange('online')}>
            Online
          </button>
          <div className="rightControls">
            <button className="rulesBtn" onClick={() => setShowRules(true)}>
              {t.rules}
            </button>
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

              <div className="kazanRow">
                <div className="kazan">
                  <span className="kazanLabel">{t.kazanOf(name2)}</span>
                  <span className="kazanVal">{activeState.kazans[1]}</span>
                </div>
                <div className="kazanLine" />
                <div className="kazan">
                  <span className="kazanLabel">{t.kazanOf(name1)}</span>
                  <span className="kazanVal">{activeState.kazans[0]}</span>
                </div>
              </div>

              <div className="pitRow">
                {Array.from({ length: 9 }, (_, i) => 17 - i).map(idx => (
                  <Pit key={idx} count={activeState.pits[idx]} index={idx} playerOwner={1}
                    clickable={isMyPitClickable(idx)}
                    tuz={activeState.tuz[0] === idx || activeState.tuz[1] === idx}
                    tuzOwner={activeState.tuz[0] === idx ? 0 : 1}
                    tuzLabel={t.tuzOwner(activeState.tuz[0] === idx ? 1 : 2)}
                    animating={animatingPits.includes(idx)}
                    landed={landedPits.includes(idx)}
                    onClick={() => handlePitClick(idx)} />
                ))}
              </div>

              <div className="boardDivider" />

              <div className="pitRow">
                {Array.from({ length: 9 }, (_, i) => i).map(idx => (
                  <Pit key={idx} count={activeState.pits[idx]} index={idx} playerOwner={0}
                    clickable={isMyPitClickable(idx)}
                    tuz={activeState.tuz[0] === idx || activeState.tuz[1] === idx}
                    tuzOwner={activeState.tuz[0] === idx ? 0 : 1}
                    tuzLabel={t.tuzOwner(activeState.tuz[0] === idx ? 1 : 2)}
                    animating={animatingPits.includes(idx)}
                    landed={landedPits.includes(idx)}
                    onClick={() => handlePitClick(idx)} />
                ))}
              </div>
            </div>
          </div>

          <History moves={history} label={t.moveHistory} noMovesLabel={t.noMoves} />
        </div>

        <div className="bottomBar">
          {mode === 'online' ? (
            <button className="btn" onClick={() => { online.leaveRoom(); setMode('ai'); }}>
              Leave Room
            </button>
          ) : (
            <button className="btn primary" onClick={() => mode === 'pvp' ? setShowModal(true) : resetGame()}>
              {t.newGame}
            </button>
          )}
        </div>
      </div>

      {showModal && <NameModal t={t} onStart={handleModalStart} />}
      {showRules && <RulesModal t={{...t, ...tt}} game="toguz" onClose={() => setShowRules(false)} />}      {showOnline && (
        <OnlineModal
          t={t}
          onClose={() => { setShowOnline(false); }}
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
            } catch(e) {
              console.error(e);
            }
          }}
        />
      )}
    </div>
  );
}