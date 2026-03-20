import { useState, useCallback } from 'react';
import { ref, set, onValue, off } from 'firebase/database';
import { db } from './firebase';

export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useOnlineGame(initialStateFn, applyMoveFn, gamePrefix = 'toguz') {
  const [roomCode, setRoomCode] = useState('');
  const [playerSeat, setPlayerSeat] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState('idle');
  const [opponentName, setOpponentName] = useState('');
  const [myName, setMyName] = useState('');
  const [error, setError] = useState('');

  const createRoom = useCallback(async (name) => {
    const code = generateRoomCode();
    setMyName(name);
    setRoomCode(code);
    setPlayerSeat(0);
    setOnlineStatus('waiting');
    setGameState(initialStateFn());

    await set(ref(db, `${gamePrefix}-rooms/${code}`), {
      state: initialStateFn(),
      player0: { name, ready: true },
      player1: null,
      createdAt: Date.now(),
    });

    onValue(ref(db, `${gamePrefix}-rooms/${code}`), (snap) => {
      const data = snap.val();
      if (!data) return;
      if (data.player1 && data.player1.name) {
        setOpponentName(data.player1.name);
        setOnlineStatus('playing');
      }
      if (data.state) setGameState(data.state);
    });

    return code;
  }, [initialStateFn, gamePrefix]);

  const joinRoom = useCallback(async (code, name) => {
    const upper = code.toUpperCase();
    const prefix = gamePrefix;

    return new Promise((resolve, reject) => {
      onValue(ref(db, `${prefix}-rooms/${upper}`), async (snap) => {
        const data = snap.val();
        console.log('joinRoom prefix:', prefix, 'upper:', upper, 'data:', data);

        if (!data) { reject(new Error('Room not found')); return; }
        if (data.player1 && data.player1.name) { reject(new Error('Room is full')); return; }

        setMyName(name);
        setRoomCode(upper);
        setPlayerSeat(1);
        setOpponentName(data.player0?.name || '');
        setOnlineStatus('playing');
        if (data.state) setGameState(data.state);

        await set(ref(db, `${prefix}-rooms/${upper}/player1`), { name, ready: true });

        onValue(ref(db, `${prefix}-rooms/${upper}/state`), (stateSnap) => {
          const s = stateSnap.val();
          if (s) setGameState(s);
        });
        
        console.log('joinRoom resolved, status: playing, seat: 1');
        resolve();
      }, { onlyOnce: true });
    });
  }, [gamePrefix]);

  const makeOnlineMove = useCallback(async (pitIdx) => {
    if (!gameState || !roomCode) return;
    if (gameState.currentPlayer !== playerSeat) return;

    const { newState } = applyMoveFn(gameState, pitIdx);
    await set(ref(db, `${gamePrefix}-rooms/${roomCode}/state`), newState);
  }, [gameState, roomCode, playerSeat, applyMoveFn, gamePrefix]);

  const leaveRoom = useCallback(() => {
    if (roomCode) off(ref(db, `${gamePrefix}-rooms/${roomCode}`));
    setRoomCode('');
    setPlayerSeat(null);
    setGameState(null);
    setOnlineStatus('idle');
    setOpponentName('');
    setMyName('');
    setError('');
  }, [roomCode, gamePrefix]);

  return {
    roomCode, playerSeat, gameState, onlineStatus,
    opponentName, myName, error,
    createRoom, joinRoom, makeOnlineMove, leaveRoom,
  };
}