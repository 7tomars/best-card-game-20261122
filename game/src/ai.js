// The Warden — the opponent. Its hand lies face-up on the table, and it
// plays by plain, readable priorities:
//   1. take a lethal strike when one is on offer,
//   2. heal, then guard, when its HP is low (8 or less),
//   3. otherwise throw its biggest affordable strike,
//   4. then burn, draw and tempo cards, then any guard left.
// Its intent — what it means to do next turn — is always on display.

import { energyForTurn } from './config.js';
import { playCard } from './state.js';

const LOW_HP = 8;

function affordable(state, side) {
  const out = [];
  side.hand.forEach((card, i) => {
    if (card.cost <= state.energy) out.push(i);
  });
  return out;
}

function pickFoePlay(state) {
  const foe = state.foe;
  const you = state.player;
  const idxs = affordable(state, foe);
  if (idxs.length === 0) return -1;
  const card = (i) => foe.hand[i];

  // 1. Lethal: a strike that gets through your Block and finishes you.
  for (const i of idxs) {
    if (card(i).dmg && card(i).dmg >= you.hp + you.block) return i;
  }
  // 2. Low HP: mend first, then wall up (biggest heal / biggest block).
  if (foe.hp <= LOW_HP) {
    const heals = idxs.filter((i) => card(i).heal);
    if (heals.length) return heals.sort((a, b) => card(b).heal - card(a).heal)[0];
    const guards = idxs.filter((i) => card(i).block);
    if (guards.length) return guards.sort((a, b) => card(b).block - card(a).block)[0];
  }
  // 3. Biggest affordable strike (ties: the pricier card).
  const strikes = idxs.filter((i) => card(i).dmg);
  if (strikes.length) {
    return strikes.sort((a, b) => card(b).dmg - card(a).dmg || card(b).cost - card(a).cost)[0];
  }
  // 4. Burn, tempo, then anything else it can afford.
  const burns = idxs.filter((i) => card(i).burn);
  if (burns.length) return burns[0];
  const tempo = idxs.filter((i) => card(i).draw || card(i).gain);
  if (tempo.length) return tempo[0];
  return idxs.sort((a, b) => card(b).cost - card(a).cost)[0];
}

// Play out the Warden's whole turn.
export function runFoeTurn(state) {
  for (let guard = 0; guard < 24 && !state.over; guard++) {
    const i = pickFoePlay(state);
    if (i < 0) return;
    if (!playCard(state, 'foe', i)) return;
  }
}

// A one-line read of what the Warden plans to do with next turn's energy.
export function foeIntent(state) {
  const foe = state.foe;
  const you = state.player;
  const energy = energyForTurn(state.turn);
  const usable = foe.hand.filter((c) => c.cost <= energy);
  if (usable.length === 0) return 'The Warden is gathering strength — no play it can afford.';
  for (const c of usable) {
    if (c.dmg && c.dmg >= you.hp + you.block) {
      return `Intent: the Warden means to finish you with ${c.name} (${c.dmg} damage).`;
    }
  }
  if (foe.hp <= LOW_HP) {
    const heal = usable.find((c) => c.heal);
    if (heal) return `Intent: wounded, the Warden means to mend with ${heal.name} (+${heal.heal} HP).`;
    const guard = usable.find((c) => c.block);
    if (guard) return `Intent: wounded, the Warden means to hide behind ${guard.name} (${guard.block} Block).`;
  }
  const strikes = usable.filter((c) => c.dmg);
  if (strikes.length) {
    const best = strikes.sort((a, b) => b.dmg - a.dmg)[0];
    return `Intent: the Warden means to strike with ${best.name} for ${best.dmg}.`;
  }
  const burn = usable.find((c) => c.burn);
  if (burn) return `Intent: the Warden means to hex you with ${burn.name} (burn ${burn.burn}).`;
  return 'The Warden is gathering strength — no strike it can afford.';
}
