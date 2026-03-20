export const TOTAL_STONES = 48;
export const WIN_THRESHOLD = 25;

export function pitOwner(i) {
  return i < 6 ? 0 : 1;
}

export function initialState() {
  return {
    pits: Array(12).fill(4),
    kazans: [0, 0],
    currentPlayer: 0,
    gameOver: false,
    winner: null,
  };
}

function checkOver(pits, kazans) {
  if (kazans[0] >= WIN_THRESHOLD) return true;
  if (kazans[1] >= WIN_THRESHOLD) return true;
  if (kazans[0] === 24 && kazans[1] === 24) return true;
  const s0 = pits.slice(0, 6).reduce((a, b) => a + b, 0);
  const s1 = pits.slice(6).reduce((a, b) => a + b, 0);
  // Also end if no player can move (all pits have 0 or 1 stone)
  const p0CanMove = pits.slice(0, 6).some(p => p > 1);
  const p1CanMove = pits.slice(6).some(p => p > 1);
  return s0 === 0 || s1 === 0 || (!p0CanMove && !p1CanMove);
}

function finalizePits(pits, kazans) {
  const p = [...pits];
  const k = [...kazans];
  const s0 = p.slice(0, 6).reduce((a, b) => a + b, 0);
  const s1 = p.slice(6).reduce((a, b) => a + b, 0);
  k[0] += s0;
  k[1] += s1;
  for (let i = 0; i < 12; i++) p[i] = 0;
  return { pits: p, kazans: k };
}

function resolveWinner(kazans) {
  if (kazans[0] > kazans[1]) return 0;
  if (kazans[1] > kazans[0]) return 1;
  return 'draw';
}

export function applyMove(state, pitIdx) {
  const { currentPlayer } = state;
  let pits = [...state.pits];
  let kazans = [...state.kazans];

  let stones = pits[pitIdx] - 1;
  pits[pitIdx] = 1;
  let cur = pitIdx;
  const path = [];

  while (stones > 0) {
    cur = (cur + 1) % 12;
    if (cur === pitIdx) continue;
    pits[cur]++;
    path.push(cur);
    stones--;
  }

  let captured = 0;
  let captureChain = [];
  let checkIdx = cur;

  while (
    pitOwner(checkIdx) !== currentPlayer &&
    (pits[checkIdx] === 2 || pits[checkIdx] === 4)
  ) {
    captureChain.push(checkIdx);
    captured += pits[checkIdx];
    pits[checkIdx] = 0;
    checkIdx = (checkIdx - 1 + 12) % 12;
    if (checkIdx === pitIdx) break;
  }

  kazans[currentPlayer] += captured;

  let gameOver = false;
  let winner = null;

  if (checkOver(pits, kazans)) {
    const fin = finalizePits(pits, kazans);
    pits = fin.pits;
    kazans = fin.kazans;
    gameOver = true;
    winner = resolveWinner(kazans);
  }

let nextPlayer;
  if (gameOver) {
    nextPlayer = currentPlayer;
  } else {
    const opponent = 1 - currentPlayer;
    const opponentStart = opponent === 0 ? 0 : 6;
    const opponentCanMove = pits.slice(opponentStart, opponentStart + 6).some(p => p > 1);
    if (opponentCanMove) {
      nextPlayer = opponent;
    } else {
      // opponent can't move — current player continues
      const currentStart = currentPlayer === 0 ? 0 : 6;
      const currentCanMove = pits.slice(currentStart, currentStart + 6).some(p => p > 1);
      nextPlayer = currentCanMove ? currentPlayer : opponent;
    }
  }
  return {
    newState: {
      pits,
      kazans,
      currentPlayer: nextPlayer,
      gameOver,
      winner,
    },
    meta: {
      pitIdx,
      player: currentPlayer,
      captured,
      lastPit: cur,
      path: [...new Set(path)],
      captureChain,
    },
  };
}

export function aiChooseMove(state) {
  let best = -1;
  let bestScore = -Infinity;

  for (let i = 6; i < 12; i++) {
    if (state.pits[i] <= 1) continue;
    const { meta } = applyMove(state, i);
    let score = meta.captured;
    if (score > bestScore) { bestScore = score; best = i; }
  }

  if (best === -1) {
    for (let i = 6; i < 12; i++) {
      if (state.pits[i] > 1) { best = i; break; }
    }
  }

  return best;
}