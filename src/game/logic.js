export const TOTAL_STONES = 162;
export const WIN_THRESHOLD = 82;

export function pitOwner(i) {
  return i < 9 ? 0 : 1;
}

export function initialState() {
  return {
    pits: Array(18).fill(9),
    kazans: [0, 0],
    tuz: [-1, -1],
    currentPlayer: 0,
    gameOver: false,
    winner: null,
  };
}

function applyTuz(pits, kazans, tuz) {
  const p = [...pits];
  const k = [...kazans];
  for (let player = 0; player < 2; player++) {
    if (tuz[player] !== -1 && p[tuz[player]] > 0) {
      k[player] += p[tuz[player]];
      p[tuz[player]] = 0;
    }
  }
  return { pits: p, kazans: k };
}

function resolveWinner(kazans) {
  if (kazans[0] > kazans[1]) return 0;
  if (kazans[1] > kazans[0]) return 1;
  return 'draw';
}

function checkOver(pits, kazans) {
  if (kazans[0] >= WIN_THRESHOLD) return true;
  if (kazans[1] >= WIN_THRESHOLD) return true;
  if (kazans[0] === 81 && kazans[1] === 81) return true;
  const s0 = pits.slice(0, 9).reduce((a, b) => a + b, 0);
  const s1 = pits.slice(9).reduce((a, b) => a + b, 0);
  return s0 === 0 || s1 === 0;
}

function finalizePits(pits, kazans) {
  const p = [...pits];
  const k = [...kazans];
  const s0 = p.slice(0, 9).reduce((a, b) => a + b, 0);
  const s1 = p.slice(9).reduce((a, b) => a + b, 0);
  k[0] += s0;
  k[1] += s1;
  for (let i = 0; i < 18; i++) p[i] = 0;
  return { pits: p, kazans: k };
}

export function applyMove(state, pitIdx) {
  const { tuz: tuzIn, currentPlayer } = state;
  let pits = [...state.pits];
  let kazans = [...state.kazans];
  let tuz = [...tuzIn];

  let stones = pits[pitIdx];
  pits[pitIdx] = 0;
  let cur = pitIdx;
  const path = [];

  while (stones > 0) {
    cur = (cur + 1) % 18;
    pits[cur]++;
    path.push(cur);
    stones--;
  }

  ({ pits, kazans } = applyTuz(pits, kazans, tuz));

  let captured = 0;
  let newTuz = false;

  if (pitOwner(cur) !== currentPlayer && pits[cur] % 2 === 0 && pits[cur] > 0) {
    captured = pits[cur];
    kazans[currentPlayer] += captured;
    pits[cur] = 0;
  }

  if (pitOwner(cur) !== currentPlayer && pits[cur] === 3 && tuz[currentPlayer] === -1) {
    const notLastPit = currentPlayer === 0 ? cur !== 17 : cur !== 8;
    const notOpponentTuz = tuz[1 - currentPlayer] !== cur;
    if (notLastPit && notOpponentTuz) {
      tuz[currentPlayer] = cur;
      kazans[currentPlayer] += 3;
      pits[cur] = 0;
      newTuz = true;
    }
  }

  ({ pits, kazans } = applyTuz(pits, kazans, tuz));

  let gameOver = false;
  let winner = null;

  if (checkOver(pits, kazans)) {
    const fin = finalizePits(pits, kazans);
    pits = fin.pits;
    kazans = fin.kazans;
    gameOver = true;
    winner = resolveWinner(kazans);
  }

  const nextPlayer = gameOver ? currentPlayer : 1 - currentPlayer;

  return {
    newState: { pits, kazans, tuz, currentPlayer: nextPlayer, gameOver, winner },
    meta: { pitIdx, player: currentPlayer, captured, newTuz, lastPit: cur, path: [...new Set(path)] },
  };
}

export function aiChooseMove(state) {
  let best = -1;
  let bestScore = -Infinity;

  for (let i = 9; i < 18; i++) {
    if (state.pits[i] === 0) continue;
    const { newState: s1, meta: m1 } = applyMove(state, i);
    let score = m1.captured;
    if (m1.newTuz) score += 25;
    for (let j = 0; j < 9; j++) {
      if (s1.pits[j] === 0) continue;
      const { meta: m2 } = applyMove(s1, j);
      score -= m2.captured * 0.6;
      if (m2.newTuz) score -= 15;
    }
    if (score > bestScore) { bestScore = score; best = i; }
  }

  return best;
}