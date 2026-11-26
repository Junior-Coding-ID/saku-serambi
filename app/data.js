// data.js — Saku Serambi: SATU sumber kebenaran.
// Semua angka di sini dijumlahkan core.js; tabel master harus selisih Rp0.
// Keluarga Arif & Maya, November 2026. Semua rupiah dalam satuan rupiah.

export const HOUSEHOLD = {
  name: 'Keluarga Arif & Maya',
  month: 'November 2026',
  monthShort: 'Nov 2026',
  members: [
    { name: 'Arif', role: 'Ayah', income: 8500000 },
    { name: 'Maya', role: 'Ibu', income: 4000000 },
  ],
};

export const INCOME_TOTAL = 12500000;

// Amplop: limit 10.500.000 / terpakai 8.700.000 / sisa 1.800.000.
// "spent" dihitung ulang dari TRANSACTIONS oleh core.js — angka di bawah
// adalah target yang HARUS sama dengan jumlah transaksi per amplop.
export const ENVELOPES = [
  { id: 'rumah', name: 'Rumah & Tagihan', color: '#2E7D5B', limit: 5900000, icon: '⌂' },
  { id: 'belanja', name: 'Belanja & Dapur', color: '#E8A33D', limit: 2200000, icon: '◍' },
  { id: 'transport', name: 'Transport', color: '#4A7FA5', limit: 1000000, icon: '➤' },
  { id: 'anak', name: 'Anak & Sekolah', color: '#8A6FBF', limit: 700000, icon: '✎' },
  { id: 'hiburan', name: 'Hiburan', color: '#D96C4F', limit: 400000, icon: '♪' },
  { id: 'kesehatan', name: 'Kesehatan', color: '#5BA8A0', limit: 300000, icon: '+' },
];

export const ENVELOPE_LIMIT_TOTAL = 10500000;
export const SAVINGS_NOV = 1500000; // 12% dari penghasilan

// Tagihan: total jatuh tempo 5.700.000; sudah dibayar 5.370.000;
// yang akan datang: Internet 28 Nov Rp330.000.
export const BILLS = [
  { id: 'sewa', name: 'Sewa Rumah', detail: 'Kontrakan, lunas tiap tanggal 5', amount: 3000000, due: '05 Nov 2026', paid: true, paidDate: '05 Nov 2026', envelope: 'rumah' },
  { id: 'asuransi', name: 'Asuransi Kesehatan', detail: 'BPJS + asuransi tambahan', amount: 850000, due: '08 Nov 2026', paid: true, paidDate: '08 Nov 2026', envelope: 'rumah' },
  { id: 'listrik', name: 'Listrik PLN', detail: 'Token + abonemen', amount: 620000, due: '10 Nov 2026', paid: true, paidDate: '10 Nov 2026', envelope: 'rumah' },
  { id: 'air', name: 'Air PDAM', detail: 'Pemakaian Oktober', amount: 240000, due: '12 Nov 2026', paid: true, paidDate: '12 Nov 2026', envelope: 'rumah' },
  { id: 'langganan', name: 'Langganan Digital', detail: 'Streaming + cloud keluarga', amount: 660000, due: '15 Nov 2026', paid: true, paidDate: '15 Nov 2026', envelope: 'rumah' },
  { id: 'internet', name: 'Internet Rumah', detail: '100 Mbps, jatuh tempo 28 Nov', amount: 330000, due: '28 Nov 2026', paid: false, paidDate: null, envelope: 'rumah' },
];

export const BILLS_TOTAL_DUE = 5700000;

// Utang: sisa Rp6.000.000 = 8 cicilan × Rp750.000.
export const DEBT = {
  name: 'Cicilan Motor — Honda Beat',
  remaining: 6000000,
  installmentsLeft: 8,
  installment: 750000,
  nextDue: '05 Des 2026',
};

// Tujuan: total tabungan Rp11.400.000.
// Emergency 9.000.000/18.000.000 (50%) · School 2.400.000/6.000.000 (40%).
// Rencana bulanan: Emergency Rp1.000.000/bln, School Rp500.000/bln.
export const GOALS = [
  { id: 'emergency', name: 'Dana Darurat', note: 'Untuk keadaan tak terduga keluarga', saved: 9000000, target: 18000000, monthly: 1000000, color: '#2E7D5B' },
  { id: 'school', name: 'Dana Sekolah Anak', note: 'Biaya masuk sekolah tahun ajaran baru', saved: 2400000, target: 6000000, monthly: 500000, color: '#8A6FBF' },
];

export const GOALS_TOTAL_SAVED = 11400000;

// Histori bulanan (penghasilan / belanja), dalam rupiah.
// Sep WAJIB tampil Rp9.85M dalam format compact.
export const HISTORY = [
  { month: 'Agu', income: 12000000, spent: 10100000 },
  { month: 'Sep', income: 12500000, spent: 9850000 },
  { month: 'Okt', income: 12500000, spent: 10300000 },
  { month: 'Nov', income: 12500000, spent: 8700000 },
];

// 40 transaksi: 2 pemasukan + 36 pengeluaran + 2 transfer tabungan.
// Pengeluaran per amplop: rumah 5.370.000, belanja 1.950.000,
// transport 820.000, anak 380.000, hiburan 130.000, kesehatan 50.000.
// Total pengeluaran = 8.700.000. Transfer: 900.000 + 600.000 = 1.500.000.
export const TRANSACTIONS = [
  { id: 't01', date: '01 Nov', desc: 'Gaji Arif', category: 'Pemasukan', envelope: null, kind: 'income', amount: 8500000 },
  { id: 't02', date: '03 Nov', desc: 'Gaji Maya', category: 'Pemasukan', envelope: null, kind: 'income', amount: 4000000 },
  { id: 't03', date: '05 Nov', desc: 'Sewa Rumah — November', category: 'Rumah & Tagihan', envelope: 'rumah', kind: 'expense', amount: 3000000, billId: 'sewa' },
  { id: 't04', date: '05 Nov', desc: 'Setoran Dana Darurat', category: 'Tabungan', envelope: null, kind: 'transfer', amount: 900000, goalId: 'emergency' },
  { id: 't05', date: '05 Nov', desc: 'Setoran Dana Sekolah', category: 'Tabungan', envelope: null, kind: 'transfer', amount: 600000, goalId: 'school' },
  { id: 't06', date: '06 Nov', desc: 'Pasar Minggu — sayur & buah', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 320000 },
  { id: 't07', date: '07 Nov', desc: 'Bensin motor', category: 'Transport', envelope: 'transport', kind: 'expense', amount: 150000 },
  { id: 't08', date: '08 Nov', desc: 'Asuransi Kesehatan', category: 'Rumah & Tagihan', envelope: 'rumah', kind: 'expense', amount: 850000, billId: 'asuransi' },
  { id: 't09', date: '08 Nov', desc: 'Supermarket — kebutuhan dapur', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 285000 },
  { id: 't10', date: '09 Nov', desc: 'Tol & parkir', category: 'Transport', envelope: 'transport', kind: 'expense', amount: 120000 },
  { id: 't11', date: '10 Nov', desc: 'Listrik PLN', category: 'Rumah & Tagihan', envelope: 'rumah', kind: 'expense', amount: 620000, billId: 'listrik' },
  { id: 't12', date: '10 Nov', desc: 'Pasar — lauk & bumbu', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 210000 },
  { id: 't13', date: '11 Nov', desc: 'Buku & alat tulis anak', category: 'Anak & Sekolah', envelope: 'anak', kind: 'expense', amount: 120000 },
  { id: 't14', date: '12 Nov', desc: 'Air PDAM', category: 'Rumah & Tagihan', envelope: 'rumah', kind: 'expense', amount: 240000, billId: 'air' },
  { id: 't15', date: '12 Nov', desc: 'Sayur keliling', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 95000 },
  { id: 't16', date: '13 Nov', desc: 'Bensin motor', category: 'Transport', envelope: 'transport', kind: 'expense', amount: 130000 },
  { id: 't17', date: '14 Nov', desc: 'Supermarket — stok mingguan', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 340000 },
  { id: 't18', date: '14 Nov', desc: 'Nonton bioskop keluarga', category: 'Hiburan', envelope: 'hiburan', kind: 'expense', amount: 60000 },
  { id: 't19', date: '15 Nov', desc: 'Langganan Digital', category: 'Rumah & Tagihan', envelope: 'rumah', kind: 'expense', amount: 660000, billId: 'langganan' },
  { id: 't20', date: '16 Nov', desc: 'Les renang anak', category: 'Anak & Sekolah', envelope: 'anak', kind: 'expense', amount: 100000 },
  { id: 't21', date: '17 Nov', desc: 'Pasar — daging & ayam', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 260000 },
  { id: 't22', date: '18 Nov', desc: 'Parkir & tol', category: 'Transport', envelope: 'transport', kind: 'expense', amount: 85000 },
  { id: 't23', date: '19 Nov', desc: 'Obat flu', category: 'Kesehatan', envelope: 'kesehatan', kind: 'expense', amount: 20000 },
  { id: 't24', date: '20 Nov', desc: 'Supermarket — kebutuhan dapur', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 145000 },
  { id: 't25', date: '20 Nov', desc: 'Ojek online', category: 'Transport', envelope: 'transport', kind: 'expense', amount: 95000 },
  { id: 't26', date: '21 Nov', desc: 'Seragam sekolah', category: 'Anak & Sekolah', envelope: 'anak', kind: 'expense', amount: 90000 },
  { id: 't27', date: '22 Nov', desc: 'Pasar — sayur & buah', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 60000 },
  { id: 't28', date: '22 Nov', desc: 'Jajan kopi', category: 'Hiburan', envelope: 'hiburan', kind: 'expense', amount: 25000 },
  { id: 't29', date: '23 Nov', desc: 'Bensin motor', category: 'Transport', envelope: 'transport', kind: 'expense', amount: 140000 },
  { id: 't30', date: '24 Nov', desc: 'Vitamin keluarga', category: 'Kesehatan', envelope: 'kesehatan', kind: 'expense', amount: 18000 },
  { id: 't31', date: '24 Nov', desc: 'Bumbu & minyak goreng', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 25000 },
  { id: 't32', date: '25 Nov', desc: 'Uang saku anak', category: 'Anak & Sekolah', envelope: 'anak', kind: 'expense', amount: 40000 },
  { id: 't33', date: '25 Nov', desc: 'Top-up game', category: 'Hiburan', envelope: 'hiburan', kind: 'expense', amount: 25000 },
  { id: 't34', date: '26 Nov', desc: 'Servis ringan motor', category: 'Transport', envelope: 'transport', kind: 'expense', amount: 100000 },
  { id: 't35', date: '26 Nov', desc: 'Snack anak', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 20000 },
  { id: 't36', date: '26 Nov', desc: 'Mainan edukasi', category: 'Anak & Sekolah', envelope: 'anak', kind: 'expense', amount: 30000 },
  { id: 't37', date: '26 Nov', desc: 'Piknik keluarga', category: 'Hiburan', envelope: 'hiburan', kind: 'expense', amount: 20000 },
  { id: 't38', date: '27 Nov', desc: 'Plester & antiseptik', category: 'Kesehatan', envelope: 'kesehatan', kind: 'expense', amount: 12000 },
  { id: 't39', date: '27 Nov', desc: 'Air galon', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 15000 },
  { id: 't40', date: '27 Nov', desc: 'Pasar — lauk & bumbu', category: 'Belanja & Dapur', envelope: 'belanja', kind: 'expense', amount: 175000 },
];

// Tips hemat yang ditampilkan di Laporan — ditulis untuk keluarga ini.
export const TIPS = [
  { title: 'Belanja pasar 2× seminggu', body: 'Belanja & Dapur sudah Rp1.950.000 dari Rp2.200.000. Belanja pasar di pagi hari dan catat daftar dulu — selisih harga pasar vs supermarket bisa Rp150.000 sebulan.' },
  { title: 'Transport turun Rp180.000', body: 'Transport November Rp820.000, turun dari Rp1.000.000 di Oktober. Pertahankan rute gabungan antar-jemput anak dan belanja dalam satu perjalanan.' },
  { title: 'Sisa amplop Rp1.800.000', body: 'Sisa amplop bulan ini bisa dipindah ke Dana Darurat — itu memangkas ETA darurat dari 9 bulan menjadi sekitar 7 bulan.' },
];
