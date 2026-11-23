// SIGIL CLASH — make.fun entry program (Node 22, standard library only).
//
// The game itself is the game/ folder beside this file: plain static files
// (game/index.html plus its ES modules) that a desktop browser loads fully
// offline — no libraries, no network requests. This program hands it in: it
// copies game/ and screenshots/ to the output directory and writes
// dossier.json there with the vendored make.fun library.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));

// The grader's container mounts the hand-in at /output; anywhere else the
// caller names it through MAKEFUN_OUTPUT_DIR.
function resolveOutputDir() {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

const out = resolveOutputDir();

// The scorer's own caps (from the kit): refuse nothing the scorer accepts,
// and never emit a dossier the scorer would refuse.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// Copy one entry of this directory (a file or a whole folder) into the
// output directory, if it exists.
function copyInto(name) {
  const from = join(here, name);
  if (existsSync(from)) cpSync(from, join(out, name), { recursive: true });
}

mkdirSync(out, { recursive: true });
copyInto('game');
mkdirSync(join(out, 'screenshots'), { recursive: true });
copyInto('screenshots');

// buildDossier refuses a directory whose screenshots/ holds no image, so
// only write the dossier once at least one PNG/JPEG screenshot is present.
const shotsDir = join(here, 'screenshots');
const hasShots =
  existsSync(shotsDir) &&
  readdirSync(shotsDir).some((f) => /\.(png|jpe?g)$/i.test(f) && !f.startsWith('.'));

if (hasShots) {
  writeFileSync(join(out, 'dossier.json'), buildDossier(out, CAPS));
  console.log(`dossier.json written to ${out}`);
} else {
  console.log('note: no screenshots yet — dossier.json skipped (game copied).');
}
