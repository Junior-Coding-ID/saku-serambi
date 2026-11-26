# Saku Serambi — Make room for what matters.

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Junior-Coding-ID/saku-serambi/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Junior-Coding-ID/saku-serambi/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

Situs anggaran rumah tangga statis untuk Keluarga Arif & Maya, November 2026.
Tanpa akun, tanpa iklan, tanpa network request — semua data tinggal di perangkat.

## Yang ada di dalam

- **Ringkasan** — sisa kas November Rp2.300.000, sisa amplop Rp1.800.000, buffer Rp500.000, Peta Uang, dan grafik penghasilan vs belanja.
- **Anggaran** — 6 amplop (limit Rp10.500.000, terpakai Rp8.700.000) plus **What-if Planner**: tambah setoran bulanan ke satu tujuan dan lihat ETA barunya.
- **Transaksi** — 40 transaksi November, bisa difilter per amplop, dicari, dan ditambah.
- **Tagihan** — total jatuh tempo Rp5.700.000, sudah dibayar Rp5.370.000, Internet Rp330.000 jatuh tempo 28 Nov. Menandai lunas langsung mencatat pengeluarannya.
- **Tujuan** — Dana Darurat Rp9.000.000/Rp18.000.000 (ETA 9,0 bln · 9 transfers · Agu 2027) dan Dana Sekolah Rp2.400.000/Rp6.000.000 (ETA 7,2 bln · 8 transfers · Jul 2027), lengkap dengan setoran.
- **Laporan** — histori Agu–Nov (September: belanja Rp9.85M), belanja per amplop, tips hemat.
- **Pengaturan** — anggota keluarga, penghasilan, dan reset data demo.

## Struktur

- `app/index.html` — kerangka + navigasi 7 view (hash-routing)
- `app/style.css` — seluruh tampilan
- `app/data.js` — satu sumber kebenaran (semua angka)
- `app/core.js` — hitungan & relasi atomik (bayar tagihan = transaksi tertaut; saldo tujuan dinamis)
- `app/app.js` — render view + semua kontrol
- `app/assets/logo.svg` — logo

## Menjalankan lokal

```sh
cd app && python3 -m http.server 8080
# buka http://localhost:8080 — lalu coba #budget, #transactions, #bills, #goals, #reports, #settings
```

## Menyerahkan (hand-in)

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` menyalin `app/` dan `screenshots/` ke direktori output dan menulis
`dossier.json` dengan `buildDossier` dari `vendor/makefun-frontend.ts` (tidak diubah).

## Lisensi

MIT — lihat [LICENSE](LICENSE).
