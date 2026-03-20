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

function canFeedOpponent(pits, player) {
  const start = player === 0 ? 0 : 6;
  for (let i = start; i < start + 6; i++) {
    if (pits[i] === 0) continue;
    // simulate sow and check if opponent gets stones
    let stones = pits[i];
    let cur = i;
    while (stones > 0) {
      cur = (cur + 1) % 12;
      if (cur === i) continue;
      stones--;
    }
    const opStart = player === 0 ? 6 : 0;
    const opEnd = opStart + 6;
    for (let j = opStart; j < opEnd; j++) {
      if (pits[j] > 0) return true;
    }
    // at least one stone lands on opponent side
    const tempPits = [...pits];
    tempPits[i] = 0;
    let s = pits[i];
    let c = i;
    while (s > 0) {
      c = (c + 1) % 12;
      if (c === i) continue;
      tempPits[c]++;
      s--;
    }
    for (let j = opStart; j < opEnd; j++) {
      if (tempPits[j] > 0) return true;
    }
  }
  return false;
}

function opponentHasStones(pits, player) {
  const opStart = player === 0 ? 6 : 0;
  for (let i = opStart; i < opStart + 6; i++) {
    if (pits[i] > 0) return true;
  }
  return false;
}

function moveFeedsOpponent(pits, pitIdx, player) {
  const tempPits = [...pits];
  let stones = tempPits[pitIdx];
  tempPits[pitIdx] = 0;
  let cur = pitIdx;
  while (stones > 0) {
    cur = (cur + 1) % 12;
    if (cur === pitIdx) continue;
    tempPits[cur]++;
    stones--;
  }
  const opStart = player === 0 ? 6 : 0;
  for (let i = opStart; i < opStart + 6; i++) {
    if (tempPits[i] > 0) return true;
  }
  return false;
}

function checkOver(pits, kazans) {
  if (kazans[0] >= WIN_THRESHOLD) return true;
  if (kazans[1] >= WIN_THRESHOLD) return true;
  if (kazans[0] === 24 && kazans[1] === 24) return true;
  const s0 = pits.slice(0, 6).reduce((a, b) => a + b, 0);
  const s1 = pits.slice(6).reduce((a, b) => a + b, 0);
  return s0 === 0 || s1 === 0;
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

  // Must feed opponent if they have no stones
  if (!opponentHasStones(pits, currentPlayer)) {
    if (!moveFeedsOpponent(pits, pitIdx, currentPlayer)) {
      // invalid move - skip (shouldn't happen with valid AI/UI)
    }
  }

  let stones = pits[pitIdx];
  pits[pitIdx] = 0;
  let cur = pitIdx;
  const path = [];

  while (stones > 0) {
    cur = (cur + 1) % 12;
    if (cur === pitIdx) continue; // skip source if > 12 stones
    pits[cur]++;
    path.push(cur);
    stones--;
  }

  // Check grand slam — would capture ALL opponent stones
  const opStart = currentPlayer === 0 ? 6 : 0;
  let wouldCaptureAll = true;
  for (let i = opStart; i < opStart + 6; i++) {
    if (pits[i] > 0 && pits[i] !== 2 && pits[i] !== 3) {
      wouldCaptureAll = false;
      break;
    }
    if (pits[i] === 0) { wouldCaptureAll = false; break; }
  }

  // Chain capture backwards from last pit
  let captured = 0;
  let captureChain = [];
  let checkIdx = cur;

  const isGrandSlam = wouldCaptureAll &&
    (pits[cur] === 2 || pits[cur] === 3) &&
    pitOwner(cur) !== currentPlayer;

  if (!isGrandSlam) {
    while (
      pitOwner(checkIdx) !== currentPlayer &&
      (pits[checkIdx] === 2 || pits[checkIdx] === 3)
    ) {
      captureChain.push(checkIdx);
      captured += pits[checkIdx];
      pits[checkIdx] = 0;
      checkIdx = (checkIdx - 1 + 12) % 12;
      if (pitOwner(checkIdx) === currentPlayer) break;
    }
  }

  kazans[currentPlayer] += captured;

  // Next player — must feed opponent
  let nextPlayer = 1 - currentPlayer;
  const nextOpStart = nextPlayer === 0 ? 6 : 0;
  const nextOpHasStones = pits.slice(nextOpStart, nextOpStart + 6).some(p => p > 0);
  if (!nextOpHasStones) {
    // next player can't feed — they take remaining stones
    const nextStart = nextPlayer === 0 ? 0 : 6;
    for (let i = nextStart; i < nextStart + 6; i++) {
      kazans[nextPlayer] += pits[i];
      pits[i] = 0;
    }
  }

  let gameOver = false;
  let winner = null;

  if (checkOver(pits, kazans)) {
    const fin = finalizePits(pits, kazans);
    pits = fin.pits;
    kazans = fin.kazans;
    gameOver = true;
    winner = resolveWinner(kazans);
  }

  const finalNextPlayer = gameOver ? currentPlayer : nextPlayer;

  return {
    newState: {
      pits,
      kazans,
      currentPlayer: finalNextPlayer,
      gameOver,
      winner,
    },
    meta: {
      pitIdx,
      player: currentPlayer,
      captured,
      isGrandSlam,
      lastPit: cur,
      path: [...new Set(path)],
      captureChain,
    },
  };
}

export function aiChooseMove(state) {
  const { currentPlayer, pits } = state;
  const start = currentPlayer === 0 ? 0 : 6;
  const opStart = currentPlayer === 0 ? 6 : 0;
  const opHasStones = pits.slice(opStart, opStart + 6).some(p => p > 0);

  let best = -1;
  let bestScore = -Infinity;

  for (let i = start; i < start + 6; i++) {
    if (pits[i] === 0) continue;
    if (opHasStones && !moveFeedsOpponent(pits, i, currentPlayer)) continue;

    const { meta } = applyMove(state, i);
    let score = meta.captured;
    if (score > bestScore) { bestScore = score; best = i; }
  }

  if (best === -1) {
    for (let i = start; i < start + 6; i++) {
      if (pits[i] > 0) { best = i; break; }
    }
  }

  return best;
}