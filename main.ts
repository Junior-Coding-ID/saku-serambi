// main.ts — Saku Serambi hand-in (Node 22, standard library only).
//
// Menyerahkan situs anggaran rumah tangga "Saku Serambi" (Keluarga Arif &
// Maya, November 2026): menyalin app/ dan screenshots/ dari samping file ini
// ke direktori output, lalu menulis dossier.json dengan buildDossier dari
// vendor/makefun-frontend.ts (file vendor itu TIDAK diubah — scorer
// mengharuskan dossier.json byte-identik dengan yang ditulis copy vendor itu).
//
// Di luar grader, MAKEFUN_OUTPUT_DIR (atau MAKEFUN_OUTPUT) menggantikan
// /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Program ini hanya menulis ke direktori output. Ia tidak menghapus apa pun
// dan tidak membaca lokasi kerja proses.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || process.env.MAKEFUN_OUTPUT || '/output';

mkdirSync(outDir, { recursive: true });
// Hapus file lama di dalam out/app dan out/screenshots (per file, bukan
// direktorinya) supaya run ulang tetap byte-identik meski ada file sumber
// yang sudah dihapus sejak run sebelumnya.
function pruneDir(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { pruneDir(p); }
    else unlinkSync(p);
  }
}
pruneDir(join(outDir, 'app'));
pruneDir(join(outDir, 'screenshots'));
mkdirSync(join(outDir, 'app'), { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Batas yang dipakai scorer (lihat RULES.txt): teks dossier max 160 KiB,
// max 4 screenshot @ 256 KiB, app/ max 993 file dan 16 MiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// Ringkasan singkat ke stdout — tidak mengubah byte output apa pun.
console.log(`Saku Serambi handed in: ${outDir} (dossier ${dossier.length} bytes)`);
