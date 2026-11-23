// The Sigil Clash card pool: 12 distinct cards across the four sigils.
// Effect fields a card may carry: dmg (strike), block (guard), heal, draw,
// gain (extra energy this turn), burn (damage at the start of each of the
// victim's turns) with burnTurns (how many of those turns it ticks).

import { DECK_COPIES } from './config.js';

export const CARD_POOL = [
  // Flame ◆ — raw aggression
  { id: 'ember-strike', name: 'Ember Strike', sigil: 'flame', cost: 1, dmg: 3,
    text: 'Strike for 3.' },
  { id: 'inferno-lance', name: 'Inferno Lance', sigil: 'flame', cost: 3, dmg: 6,
    text: 'Strike for 6.' },
  { id: 'cinder-brand', name: 'Cinder Brand', sigil: 'flame', cost: 2, dmg: 1, burn: 2, burnTurns: 2,
    text: 'Strike for 1. Burn 2 for 2 turns.' },
  // Tide ● — guard and mend
  { id: 'tide-guard', name: 'Tide Guard', sigil: 'tide', cost: 1, block: 4,
    text: 'Gain 4 Block.' },
  { id: 'wave-wall', name: 'Wave Wall', sigil: 'tide', cost: 2, block: 7,
    text: 'Gain 7 Block.' },
  { id: 'healing-spring', name: 'Healing Spring', sigil: 'tide', cost: 2, heal: 4,
    text: 'Heal 4 HP.' },
  // Thorn ▲ — cheap cuts and tempo
  { id: 'thorn-jab', name: 'Thorn Jab', sigil: 'thorn', cost: 0, dmg: 2,
    text: 'Strike for 2.' },
  { id: 'briar-snare', name: 'Briar Snare', sigil: 'thorn', cost: 2, dmg: 3, draw: 1,
    text: 'Strike for 3. Draw 1.' },
  { id: 'sap-surge', name: 'Sap Surge', sigil: 'thorn', cost: 1, gain: 1, draw: 1,
    text: 'Gain 1 energy. Draw 1.' },
  // Gloom ■ — hexes and doom
  { id: 'gloom-hex', name: 'Gloom Hex', sigil: 'gloom', cost: 2, dmg: 2, burn: 1, burnTurns: 3,
    text: 'Strike for 2. Burn 1 for 3 turns.' },
  { id: 'shadow-veil', name: 'Shadow Veil', sigil: 'gloom', cost: 1, block: 3, draw: 1,
    text: 'Gain 3 Block. Draw 1.' },
  { id: 'doom-sigil', name: 'Doom Sigil', sigil: 'gloom', cost: 4, dmg: 8,
    text: 'Strike for 8.' },
];

export function cardById(id) {
  return CARD_POOL.find((c) => c.id === id);
}

// A fresh 24-card deck: two copies of every card in the pool.
export function buildDeck() {
  const deck = [];
  for (let copy = 0; copy < DECK_COPIES; copy++) {
    for (const card of CARD_POOL) deck.push(card);
  }
  return deck;
}
