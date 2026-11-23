// Sigil Clash — input. Mouse: click a card in your hand to play it, click
// the buttons. Keyboard: Enter ends your turn (or starts from the title),
// R restarts from a win/loss screen.

export function wireInput(root, handlers) {
  root.addEventListener('click', (ev) => {
    const card = ev.target.closest('[data-play-index]');
    if (card) {
      handlers.onPlayCard(Number(card.dataset.playIndex));
      return;
    }
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'end') handlers.onEndTurn();
    else if (btn.dataset.action === 'start') handlers.onStart();
    else if (btn.dataset.action === 'again') handlers.onRestart();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') handlers.onEnter();
    else if (ev.key === 'r' || ev.key === 'R') handlers.onRestartKey();
  });
}
