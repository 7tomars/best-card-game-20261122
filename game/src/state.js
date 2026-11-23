// Sigil Clash — game state and rules.
//
// A duel: you and the Warden each start at 20 HP with a shuffled 24-card
// deck. On your turn you get energy (3, then +1 each turn, cap 8) and spend
// it playing cards from your hand. Block absorbs strike damage and resets
// to 0 at the start of its owner's turn. Burn ignores Block and ticks at
// the start of each of the victim's turns. Reduce the foe to 0 HP to win;
// fall to 0 yourself and you lose.

import { START_HP, OPENING_HAND, MAX_HAND, energyForTurn } from './config.js';
import { buildDeck } from './cards.js';
import { shuffle } from './random.js';

function makeSide(name, deck) {
  return {
    name,
    hp: START_HP,
    maxHp: START_HP,
    block: 0,
    burn: 0,
    burnTurns: 0,
    deck,
    hand: [],
    discard: [],
  };
}

export function otherKey(key) {
  return key === 'player' ? 'foe' : 'player';
}

export function createGame(rng) {
  const state = {
    screen: 'battle',
    turn: 1,
    active: 'player',
    energy: energyForTurn(1),
    score: 0,
    over: null, // 'win' | 'loss' once decided
    table: [], // cards played most recently, shown in the play area
    log: [],
    rng,
    player: makeSide('You', shuffle(buildDeck(), rng)),
    foe: makeSide('The Warden', shuffle(buildDeck(), rng)),
  };
  drawCards(state, state.player, OPENING_HAND);
  drawCards(state, state.foe, OPENING_HAND);
  logLine(state, 'The duel begins. First to 0 HP falls.');
  return state;
}

export function logLine(state, line) {
  state.log.push(line);
  if (state.log.length > 30) state.log.splice(0, state.log.length - 30);
}

export function drawCards(state, side, n) {
  for (let i = 0; i < n; i++) {
    if (side.hand.length >= MAX_HAND) return;
    if (side.deck.length === 0) {
      if (side.discard.length === 0) return;
      side.deck = shuffle(side.discard, state.rng);
      side.discard = [];
    }
    side.hand.push(side.deck.pop());
  }
}

// Strike damage: Block soaks first, the rest wounds. Burn never calls this.
export function applyDamage(state, targetKey, amount) {
  const target = state[targetKey];
  const soaked = Math.min(target.block, amount);
  target.block -= soaked;
  const wound = amount - soaked;
  target.hp = Math.max(0, target.hp - wound);
  if (targetKey === 'foe') state.score += wound * 10;
  return { soaked, wound };
}

export function checkOver(state) {
  if (state.over) return;
  if (state.foe.hp <= 0) {
    state.over = 'win';
    state.screen = 'win';
    state.score += 100 + state.player.hp * 5;
    logLine(state, 'The Warden falls. Victory is yours.');
  } else if (state.player.hp <= 0) {
    state.over = 'loss';
    state.screen = 'loss';
    logLine(state, 'You fall. The Warden keeps the table.');
  }
}

// Begin a side's turn: its Block resets, its Burn ticks, energy is set and
// it draws a card.
export function startTurn(state, key) {
  const side = state[key];
  side.block = 0;
  if (side.burn > 0 && side.burnTurns > 0) {
    side.hp = Math.max(0, side.hp - side.burn);
    logLine(state, `${side.name} burn${side.name === 'You' ? '' : 's'} for ${side.burn}.`);
    side.burnTurns -= 1;
    if (side.burnTurns <= 0) side.burn = 0;
    checkOver(state);
    if (state.over) return;
  }
  state.energy = energyForTurn(state.turn);
  drawCards(state, side, 1);
}

// Play the card at handIndex for the active side. Returns false (and does
// nothing) when the play is illegal: wrong turn, game over, or too costly.
export function playCard(state, key, handIndex) {
  if (state.over || state.active !== key) return false;
  const side = state[key];
  const foe = state[otherKey(key)];
  const card = side.hand[handIndex];
  if (!card || card.cost > state.energy) return false;

  state.energy -= card.cost;
  side.hand.splice(handIndex, 1);
  side.discard.push(card);
  state.table.push({ card, by: key });

  const who = key === 'player' ? 'You play' : `${side.name} plays`;
  if (card.dmg) {
    const { soaked, wound } = applyDamage(state, otherKey(key), card.dmg);
    logLine(state, `${who} ${card.name}: ${card.dmg} damage${soaked ? ` (${soaked} blocked)` : ''}${wound ? `, ${foe.name} at ${foe.hp} HP` : ''}.`);
  }
  if (card.block) {
    side.block += card.block;
    logLine(state, `${who} ${card.name}: +${card.block} Block.`);
  }
  if (card.heal) {
    const healed = Math.min(side.maxHp - side.hp, card.heal);
    side.hp += healed;
    logLine(state, `${who} ${card.name}: heal ${healed} HP.`);
  }
  if (card.gain) {
    state.energy += card.gain;
    logLine(state, `${who} ${card.name}: +${card.gain} energy.`);
  }
  if (card.burn) {
    foe.burn += card.burn;
    foe.burnTurns = Math.max(foe.burnTurns, card.burnTurns);
    logLine(state, `${who} ${card.name}: ${foe.name} burn${foe.name === 'You' ? '' : 's'} ${foe.burn} for ${foe.burnTurns} turns.`);
  }
  if (card.draw) {
    drawCards(state, side, card.draw);
    logLine(state, `${who} ${card.name}: draw ${card.draw}.`);
  }
  checkOver(state);
  return true;
}
