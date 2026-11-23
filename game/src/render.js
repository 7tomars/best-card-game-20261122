// Sigil Clash — rendering. Four screens drawn into #app from game state:
// title, battle, win and loss. Pure DOM, no framework, no assets.

import { SIGILS } from './config.js';
import { foeIntent } from './ai.js';

function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

function bigText(card) {
  if (card.dmg) return `${card.dmg} DMG`;
  if (card.block) return `${card.block} BLK`;
  if (card.heal) return `${card.heal} HEAL`;
  if (card.draw) return `DRAW ${card.draw}`;
  return 'PLAY';
}

export function cardEl(card, opts = {}) {
  const sigil = SIGILS[card.sigil];
  const el = h('div', 'card' + (opts.cls ? ` ${opts.cls}` : ''));
  el.style.setProperty('--sigil', sigil.color);
  el.title = `${card.name} — ${sigil.name}, cost ${card.cost}. ${card.text}`;
  el.append(
    h('div', 'cost', String(card.cost)),
    h('div', 'glyph', sigil.glyph),
    h('div', 'name', card.name),
    h('div', 'text', card.text),
    h('div', 'sigilname', sigil.name),
    h('div', 'big', bigText(card)),
  );
  if (opts.playIndex !== undefined) el.dataset.playIndex = String(opts.playIndex);
  return el;
}

function hpBar(side, cls) {
  const wrap = h('div', `hpbar ${cls}`);
  const fill = h('div', 'fill');
  fill.style.width = `${Math.max(0, (side.hp / side.maxHp) * 100)}%`;
  wrap.append(fill, h('div', 'hptext', `HP ${side.hp} / ${side.maxHp}`));
  return wrap;
}

function pips(side, state, isActive) {
  const parts = [];
  if (isActive) parts.push(`<span class="energy">Energy ${state.energy}</span>`);
  if (side.block > 0) parts.push(`<span class="block">Block ${side.block}</span>`);
  if (side.burn > 0) parts.push(`<span class="burn">Burn ${side.burn} (${side.burnTurns}t)</span>`);
  parts.push(`Deck ${side.deck.length}`);
  const el = h('div', 'pips');
  el.innerHTML = parts.join(' · ');
  return el;
}

function duelistRow(label, sub, side, state, key) {
  const row = h('div', 'duelist');
  const who = h('div', 'who', label);
  who.append(h('small', null, sub));
  row.append(who, hpBar(side, key === 'foe' ? 'foe' : 'me'), pips(side, state, state.active === key));
  return row;
}

function handRow(side, cls, opts = {}) {
  const row = h('div', `hand ${cls}`);
  side.hand.forEach((card, i) => {
    const el = cardEl(card, { cls: opts.mini ? 'mini' : '' });
    if (opts.playable) {
      el.dataset.playIndex = String(i);
      if (card.cost > opts.energy) el.classList.add('unaffordable');
    }
    row.append(el);
  });
  if (side.hand.length === 0) row.append(h('div', 'empty', 'No cards in hand.'));
  return row;
}

function renderTitle(root) {
  root.append(
    h('h1', 'title', 'SIGIL CLASH'),
    h('p', 'subtitle', 'A card duel of four sigils — ◆ Flame · ● Tide · ▲ Thorn · ■ Gloom'),
  );
  const how = h('div', 'howto');
  how.innerHTML =
    'You and the Warden start at <b>20 HP</b>. Each turn you gain <b>energy</b> ' +
    '(3, then +1 a turn) and play cards from your hand: <b>strikes</b> wound, ' +
    '<b>guards</b> raise Block that soaks damage until your next turn, ' +
    '<b>burn</b> ticks through it all. The Warden\'s hand lies face-up and its ' +
    '<b>intent</b> is always shown — plan around it. First duelist to 0 HP falls.';
  root.append(how);
  const btn = h('button', null, 'Play');
  btn.dataset.action = 'start';
  const center = h('div', 'center');
  center.append(btn);
  root.append(center);
}

function renderBattle(root, state) {
  root.append(duelistRow('The Warden', 'your foe — hand face-up', state.foe, state, 'foe'));
  root.append(handRow(state.foe, 'foe', { mini: true }));
  root.append(h('div', 'intent', foeIntent(state)));

  const table = h('div', 'table');
  table.append(h('div', 'label', '— the table —'));
  if (state.table.length) {
    const row = h('div', 'row');
    for (const play of state.table.slice(-4)) {
      row.append(cardEl(play.card, { cls: 'on-table mini' }));
    }
    table.append(row);
  } else {
    table.append(h('div', 'empty', 'No cards played yet. Click a card in your hand to play it.'));
  }
  root.append(table);

  root.append(handRow(state.player, 'player', { playable: true, energy: state.energy }));
  root.append(duelistRow('You', 'click a card to play it', state.player, state, 'player'));

  const controls = h('div', 'controls');
  const info = h('div', 'turninfo');
  info.innerHTML = `Turn <b>${state.turn}</b> · Score <b>${state.score}</b> · Enter ends your turn`;
  const end = h('button', null, 'End Turn');
  end.dataset.action = 'end';
  controls.append(info, end);
  root.append(controls);

  const log = h('div', 'log');
  for (const line of state.log.slice(-6).reverse()) log.append(h('div', null, line));
  root.append(log);
}

function renderEnd(root, state, won) {
  const banner = h('div', `banner ${won ? 'win' : 'loss'}`);
  banner.append(
    h('h1', 'verdict', won ? 'VICTORY' : 'DEFEAT'),
    h('p', null, won
      ? `The Warden falls on turn ${state.turn}. The table is yours.`
      : `You fall on turn ${state.turn}. The Warden keeps the table.`),
  );
  const score = h('div', 'score');
  score.innerHTML = `Final score <b>${state.score}</b>`;
  banner.append(score);
  const btn = h('button', null, 'Play Again');
  btn.dataset.action = 'again';
  banner.append(btn);
  banner.append(h('p', null, 'Press R to play again.'));
  root.append(banner);
}

export function render(root, state) {
  root.replaceChildren();
  if (state.screen === 'title') renderTitle(root);
  else if (state.screen === 'win') renderEnd(root, state, true);
  else if (state.screen === 'loss') renderEnd(root, state, false);
  else renderBattle(root, state);
}
