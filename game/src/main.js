// Sigil Clash — entry point. Wires state, rendering and input together.
// A normal visit starts at the title screen; ?shot=<kind>&seed=<n> opens a
// fixed screenshot state instead (see shots.js and shots.json).

import { createGame, startTurn, playCard } from './state.js';
import { runFoeTurn } from './ai.js';
import { render } from './render.js';
import { wireInput } from './input.js';
import { setupShot } from './shots.js';
import { mulberry32 } from './random.js';

const root = document.getElementById('app');
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) && params.get('seed') !== null ? seedParam : 7;

let state;
if (shot) {
  state = setupShot(shot, seed);
} else {
  state = createGame(mulberry32((Math.random() * 2 ** 31) | 0));
  state.screen = 'title';
}

function draw() {
  render(root, state);
}

function freshGame() {
  state = createGame(mulberry32((Math.random() * 2 ** 31) | 0));
  draw();
}

function endTurn() {
  if (state.screen !== 'battle' || state.over) return;
  state.active = 'foe';
  state.table = [];
  startTurn(state, 'foe');
  if (!state.over) runFoeTurn(state);
  if (!state.over) {
    state.turn += 1;
    state.active = 'player';
    state.table = [];
    startTurn(state, 'player');
  }
  draw();
}

wireInput(root, {
  onPlayCard(i) {
    if (state.screen === 'battle' && playCard(state, 'player', i)) draw();
  },
  onEndTurn: endTurn,
  onStart() {
    state.screen = 'battle';
    draw();
  },
  onRestart: freshGame,
  onEnter() {
    if (state.screen === 'title') {
      state.screen = 'battle';
      draw();
    } else if (state.screen === 'battle') {
      endTurn();
    }
  },
  onRestartKey() {
    if (state.screen === 'win' || state.screen === 'loss') freshGame();
  },
});

draw();
