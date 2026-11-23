// Deterministic screenshot states. Opening the game with
//   ?shot=title|battle|win|loss&seed=N
// builds a fixed scene with no user input, so the four screenshots in
// shots.json always show the same, fully readable game.

import { createGame, logLine } from './state.js';
import { cardById } from './cards.js';
import { mulberry32 } from './random.js';

export function setupShot(kind, seed) {
  const state = createGame(mulberry32(seed));

  if (kind === 'title') {
    state.screen = 'title';
    return state;
  }

  if (kind === 'battle') {
    // A seeded duel, three turns in: you are ahead but the Warden is armed.
    state.turn = 3;
    state.energy = 3;
    state.player.hp = 14;
    state.player.block = 2;
    state.foe.hp = 9;
    state.foe.block = 3;
    state.foe.burn = 2;
    state.foe.burnTurns = 1;
    state.score = 110;
    state.table = [
      { card: cardById('ember-strike'), by: 'player' },
      { card: cardById('tide-guard'), by: 'foe' },
    ];
    state.log = [];
    logLine(state, 'Turn 3. Your move.');
    logLine(state, 'The Warden plays Tide Guard: +4 Block.');
    logLine(state, 'You play Cinder Brand: the Warden burns 2 for 2 turns.');
    logLine(state, 'You play Ember Strike: 3 damage (3 blocked).');
    return state;
  }

  if (kind === 'win') {
    state.turn = 6;
    state.player.hp = 11;
    state.foe.hp = 0;
    state.score = 355;
    state.over = 'win';
    state.screen = 'win';
    logLine(state, 'You play Doom Sigil: 8 damage. The Warden falls.');
    return state;
  }

  if (kind === 'loss') {
    state.turn = 5;
    state.player.hp = 0;
    state.foe.hp = 7;
    state.score = 130;
    state.over = 'loss';
    state.screen = 'loss';
    logLine(state, 'The Warden plays Inferno Lance: 6 damage. You fall.');
    return state;
  }

  state.screen = 'title';
  return state;
}
