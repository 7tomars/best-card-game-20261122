// Sigil Clash — tuning constants and the four sigils.
// Sigils are told apart by BOTH colour and shape, so the game stays readable
// in greyscale and at thumbnail size.

export const START_HP = 20;
export const OPENING_HAND = 5;
export const MAX_HAND = 9;
export const DECK_COPIES = 2; // 12 distinct cards x 2 copies = a 24-card deck

export const SIGILS = {
  flame: { name: 'Flame', glyph: '◆', color: '#e5484d' },
  tide:  { name: 'Tide',  glyph: '●', color: '#3e9be9' },
  thorn: { name: 'Thorn', glyph: '▲', color: '#46a758' },
  gloom: { name: 'Gloom', glyph: '■', color: '#9a6cc8' },
};

// Energy grows by one each of your turns: 3, 4, 5, ... capped at 8.
export function energyForTurn(turn) {
  return Math.min(3 + (turn - 1), 8);
}
