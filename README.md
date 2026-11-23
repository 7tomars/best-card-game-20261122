# best-card-game-20261122

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/7tomars/best-card-game-20261122/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/7tomars/best-card-game-20261122/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Sigil Clash** is an original card duel that runs entirely in the browser — static files only, no network requests, no external assets. You face the Warden across a dark-felt table. Both duelists start at 20 HP with a shuffled 24-card deck built from a pool of 12 cards across four sigils, each told apart by colour *and* shape: ◆ Flame (red), ● Tide (blue), ▲ Thorn (green), ■ Gloom (purple).

Each turn you gain energy (3, then +1 per turn up to 8) and spend it on cards from your hand: strikes wound, guards raise Block that soaks damage and resets at the start of your next turn, heals mend, and burn cards keep ticking damage at the start of the victim's turns, ignoring Block. The Warden's hand lies face-up and its intent — the play it means to make next turn — is always shown as a readable line, so every loss is a lesson: it takes lethal when it can, mends and walls up when wounded, and otherwise throws its biggest strike. Win by reducing the Warden to 0 HP; your score grows with every point of damage you deal, plus a bonus for the HP you keep. Mouse clicks play cards and press buttons; Enter ends your turn and R restarts from an end screen. Deterministic screenshot states live at `?shot=title|battle|win|loss&seed=N`.

## Run it

```sh
python3 -m http.server -d game 8080   # then open http://localhost:8080
```

---
<sub>Entered on [make.fun](https://make.fun/?ref=xs6hh474&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
