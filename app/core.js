// core.js — Saku Serambi: hitungan & relasi atomik.
// data.js satu-satunya sumber kebenaran; file ini hanya MENGHITUNG dari data itu.
// Aturan atomik: markBillPaid() menandai tagihan lunas DAN membuat transaksi
// expense tertaut (billId) di amplop tagihan itu — saldo amplop, kas November,
// dan total tagihan terbayar berubah bersamaan, tidak pernah setengah-setengah.
// Saldo tujuan (goals) dinamis: deposit() menambah saved dan mengubah ETA.

import {
  BILLS, DEBT, ENVELOPES, ENVELOPE_LIMIT_TOTAL, GOALS, HISTORY,
  HOUSEHOLD, INCOME_TOTAL, SAVINGS_NOV, TRANSACTIONS,
} from './data.js';

// --- format uang -----------------------------------------------------------
export function formatIDR(n) {
  return 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Compact: 12.500.000 -> Rp12.5M, 9.850.000 -> Rp9.85M (September WAJIB Rp9.85M).
export function formatIDRCompact(n) {
  const m = n / 1000000;
  const s = (Math.round(m * 100) / 100).toString().replace('.', ',');
  return 'Rp' + s + 'M';
}

export function formatPct(n) {
  return (Math.round(n * 10) / 10).toString().replace('.', ',') + '%';
}

// ETA bulan dengan satu desimal koma: 9 -> "9,0", 7.2 -> "7,2".
export function formatMonths(m) {
  return m.toFixed(1).replace('.', ',');
}

// --- state kerja (salinan data agar aksi pengguna tidak merusak data.js) ---
export const state = {
  bills: BILLS.map((b) => ({ ...b })),
  goals: GOALS.map((g) => ({ ...g })),
  transactions: TRANSACTIONS.map((t) => ({ ...t })),
  debt: { ...DEBT },
};

export function resetState() {
  state.bills = BILLS.map((b) => ({ ...b }));
  state.goals = GOALS.map((g) => ({ ...g }));
  state.transactions = TRANSACTIONS.map((t) => ({ ...t }));
  state.debt = { ...DEBT };
}

// --- agregat (selalu dihitung dari transaksi, bukan dari angka yang dihafal) -
export function sumBy(list, pred) {
  return list.filter(pred).reduce((a, t) => a + t.amount, 0);
}

export function totalIncome() {
  return sumBy(state.transactions, (t) => t.kind === 'income');
}

export function totalSpent() {
  return sumBy(state.transactions, (t) => t.kind === 'expense');
}

export function totalTransfers() {
  return sumBy(state.transactions, (t) => t.kind === 'transfer');
}

export function envelopeSpent(id) {
  return sumBy(state.transactions, (t) => t.kind === 'expense' && t.envelope === id);
}

export function envelopeRows() {
  return ENVELOPES.map((e) => {
    const spent = envelopeSpent(e.id);
    return { ...e, spent, remaining: e.limit - spent, pct: spent / e.limit };
  });
}

export function envelopeRemainingTotal() {
  return ENVELOPE_LIMIT_TOTAL - totalSpent();
}

// Label kas JUJUR — tanpa "Safe to Spend" / "Net Liquid".
export function cashSummary() {
  const income = totalIncome();
  const spent = totalSpent();
  const saved = totalTransfers();
  const cashLeft = income - spent - saved; // 12.500.000 - 8.700.000 - 1.500.000 = 2.300.000
  const remainingEnvelopes = envelopeRemainingTotal(); // 1.800.000
  return {
    income,
    spent,
    saved,
    cashLeft,
    remainingEnvelopes,
    buffer: cashLeft - remainingEnvelopes, // 500.000
  };
}

export function billsSummary() {
  const due = state.bills.reduce((a, b) => a + b.amount, 0);
  const paid = state.bills.filter((b) => b.paid).reduce((a, b) => a + b.amount, 0);
  const upcoming = state.bills.filter((b) => !b.paid);
  return { due, paid, upcoming, upcomingTotal: upcoming.reduce((a, b) => a + b.amount, 0) };
}

export function goalsSummary() {
  return state.goals.map((g) => ({
    ...g,
    remaining: g.target - g.saved,
    pct: g.saved / g.target,
    eta: goalEta(g),
  }));
}

export function goalsTotalSaved() {
  return state.goals.reduce((a, g) => a + g.saved, 0);
}

// --- ETA tujuan ------------------------------------------------------------
// months = ceil(sisa / setoran bulanan); finish = bulan selesai (Nov 2026 + months).
// Emergency: sisa 9.000.000 / 1.000.000 = 9,0 bln · 9 transfers · Agu 2027.
// School: sisa 3.600.000 / 500.000 = 7,2 bln -> 8 transfers · Jul 2027.
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function monthLabel(monthsAhead) {
  // Bulan acuan November 2026 (indeks 10).
  const total = 10 + monthsAhead;
  const year = 2026 + Math.floor(total / 12);
  return MONTHS_ID[total % 12] + ' ' + year;
}

export function goalEta(goal, extraMonthly = 0) {
  const monthly = goal.monthly + extraMonthly;
  const remaining = goal.target - goal.saved;
  if (remaining <= 0) return { months: 0, transfers: 0, finish: 'Selesai', done: true };
  const exact = remaining / monthly;
  const transfers = Math.ceil(exact);
  return {
    months: Math.round(exact * 10) / 10,
    transfers,
    finish: monthLabel(transfers),
    done: false,
  };
}

// --- aksi atomik -----------------------------------------------------------
export function markBillPaid(billId, dateLabel = '27 Nov') {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill || bill.paid) return null;
  bill.paid = true;
  bill.paidDate = dateLabel + ' 2026';
  // Transaksi expense tertaut: satu aksi, dua efek yang konsisten.
  const txn = {
    id: 't' + String(state.transactions.length + 1).padStart(2, '0') + '-' + billId,
    date: dateLabel,
    desc: bill.name + ' — dibayar',
    category: 'Rumah & Tagihan',
    envelope: bill.envelope,
    kind: 'expense',
    amount: bill.amount,
    billId: bill.id,
  };
  state.transactions.push(txn);
  return txn;
}

export function addTransaction(desc, amount, envelopeId) {
  const env = ENVELOPES.find((e) => e.id === envelopeId);
  if (!env || !desc || !(amount > 0)) return null;
  const txn = {
    id: 't' + String(state.transactions.length + 1).padStart(2, '0') + '-new',
    date: '27 Nov',
    desc,
    category: env.name,
    envelope: envelopeId,
    kind: 'expense',
    amount: Math.round(amount),
    billId: null,
  };
  state.transactions.push(txn);
  return txn;
}

// Setoran ke tujuan: saldo dinamis, ETA dihitung ulang dari saldo baru.
export function depositToGoal(goalId, amount) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal || !(amount > 0)) return null;
  const amt = Math.min(Math.round(amount), goal.target - goal.saved);
  if (amt <= 0) return null;
  goal.saved += amt;
  state.transactions.push({
    id: 't' + String(state.transactions.length + 1).padStart(2, '0') + '-goal',
    date: '27 Nov',
    desc: 'Setoran ' + goal.name,
    category: 'Tabungan',
    envelope: null,
    kind: 'transfer',
    amount: amt,
    goalId: goal.id,
  });
  return { goal, amount: amt, eta: goalEta(goal) };
}

export function historyRows() {
  return HISTORY.map((h) => ({ ...h, saved: h.income - h.spent }));
}

export function savingsRateNov() {
  return SAVINGS_NOV / INCOME_TOTAL; // 0,12 = 12%
}

export { HOUSEHOLD, ENVELOPE_LIMIT_TOTAL, INCOME_TOTAL, SAVINGS_NOV };
