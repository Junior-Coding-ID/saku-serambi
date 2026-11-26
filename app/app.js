// app.js — Saku Serambi: render 7 view + semua kontrol.
// Hash-routing: #overview #budget #transactions #bills #goals #reports #settings.
// Semua angka dirender dari core.js (yang menghitung dari data.js) —
// tidak ada angka yang ditulis tangan di template HTML.

import {
  addTransaction, billsSummary, cashSummary, depositToGoal, envelopeRows,
  formatIDR, formatIDRCompact, formatMonths, formatPct, goalEta, goalsSummary, goalsTotalSaved,
  historyRows, markBillPaid, resetState, savingsRateNov, state,
} from './core.js';
import { DEBT, ENVELOPE_LIMIT_TOTAL, HISTORY, HOUSEHOLD, INCOME_TOTAL, SAVINGS_NOV, TIPS } from './data.js';

const VIEWS = ['overview', 'budget', 'transactions', 'bills', 'goals', 'reports', 'settings'];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (n) => formatIDR(n);
const signed = (t) => (t.kind === 'income' ? '+' : t.kind === 'expense' ? '−' : '→') + formatIDR(t.amount);

// What-if Planner: setoran BULANAN tambahan, tujuan WAJIB dipilih.
const planner = { goalId: 'emergency', extra: 500000 };

function route() {
  const hash = (location.hash || '#overview').replace('#', '');
  const view = VIEWS.includes(hash) ? hash : 'overview';
  document.querySelectorAll('.view').forEach((s) => { s.hidden = s.dataset.view !== view; });
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === view));
  render(view);
  window.scrollTo(0, 0);
}

function render(view) {
  ({ overview: renderOverview, budget: renderBudget, transactions: renderTransactions,
    bills: renderBills, goals: renderGoals, reports: renderReports, settings: renderSettings })[view]();
}

function head(title, lede) {
  return `<div class="view-head"><h1>${title}</h1><p class="lede">${lede}</p></div>`;
}

// --- Ringkasan ---------------------------------------------------------------
function renderOverview() {
  const c = cashSummary();
  const bills = billsSummary();
  const goals = goalsSummary();
  const rows = envelopeRows();
  // Money Map: 5 segmen belanja amplop (terbesar dulu) + legenda 5 chip.
  const map = [...rows].sort((a, b) => b.spent - a.spent);
  const top4 = map.slice(0, 4);
  const other = map.slice(4).reduce((a, e) => a + e.spent, 0);
  const segs = [...top4.map((e) => ({ name: e.name, color: e.color, v: e.spent })),
    { name: 'Lainnya', color: '#9AA79E', v: other }];
  const total = c.spent;
  const recent = [...state.transactions].slice(-5).reverse();
  document.getElementById('view-overview').innerHTML = head(
    'Ringkasan November',
    'Keluarga Arif &amp; Maya — penghasilan Rp12.500.000, belanja Rp8.700.000, tabungan Rp1.500.000. Semua angka di bawah ini dihitung dari 40 transaksi bulan ini.',
  ) + `
  <div class="grid g3">
    <div class="card cash"><p class="label">Sisa Kas November</p><p class="big">${money(c.cashLeft)}</p><p class="sub">Penghasilan ${money(c.income)} − belanja ${money(c.spent)} − tabungan ${money(c.saved)}</p></div>
    <div class="card cash amber"><p class="label">Sisa Amplop</p><p class="big">${money(c.remainingEnvelopes)}</p><p class="sub">Dari total limit amplop ${money(ENVELOPE_LIMIT_TOTAL)}; terpakai ${money(c.spent)}</p></div>
    <div class="card cash blue"><p class="label">Buffer Belum Dialokasikan</p><p class="big">${money(c.buffer)}</p><p class="sub">Sisa kas − sisa amplop. Bebas dipakai atau dipindah ke tabungan.</p></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card">
      <h2>Peta Uang — ke mana belanja pergi</h2>
      <p class="sub">Total belanja ${money(total)} dari 6 amplop. Segmen tipis tidak diberi teks di dalam bar.</p>
      <div class="moneymap" role="img" aria-label="Peta uang belanja November">${segs.map((s) => `<span style="width:${(s.v / total * 100).toFixed(1)}%;background:${s.color}" title="${esc(s.name)} ${money(s.v)}"></span>`).join('')}</div>
      <div class="chips">${segs.map((s) => `<span class="chip"><i style="background:${s.color}"></i>${esc(s.name)} · ${money(s.v)}</span>`).join('')}</div>
      <p class="note" style="margin-top:12px">Tabungan bulan ini ${money(SAVINGS_NOV)} (12% penghasilan) dan sisa kas ${money(c.cashLeft)} melengkapi peta: ${money(c.spent)} + ${money(SAVINGS_NOV)} + ${money(c.cashLeft)} = ${money(INCOME_TOTAL)}.</p>
    </div>
    <div class="card">
      <h2>Penghasilan vs Belanja</h2>
      <p class="sub">Empat bulan terakhir. September: belanja ${formatIDRCompact(9850000)}.</p>
      <div class="chart">${historyRows().map((h) => `
        <div class="chart-col"><div class="chart-bars">
          <i class="inc" style="height:${Math.round(h.income / 125000)}px" title="Penghasilan ${money(h.income)}"></i>
          <i class="out" style="height:${Math.round(h.spent / 125000)}px" title="Belanja ${money(h.spent)}"></i>
        </div><p class="m">${h.month}</p><p class="v">${formatIDRCompact(h.income)} masuk<br>${formatIDRCompact(h.spent)} keluar</p></div>`).join('')}
      </div>
      <p class="legend"><span><i style="background:var(--green)"></i>Penghasilan</span><span><i style="background:var(--amber)"></i>Belanja</span></p>
    </div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card">
      <h2>Tagihan berikutnya</h2>
      <p class="sub">Sudah dibayar ${money(bills.paid)} dari total jatuh tempo ${money(bills.due)}.</p>
      ${bills.upcoming.map((b) => `<div class="bill-row"><div><b>${esc(b.name)}</b><p class="sub">${esc(b.detail)}</p></div><div style="text-align:right"><p class="amount">${money(b.amount)}</p><span class="pill due">Jatuh tempo ${esc(b.due)}</span></div></div>`).join('')}
      <p style="margin-top:12px"><a href="#bills">Lihat semua tagihan →</a></p>
    </div>
    <div class="card">
      <h2>Tujuan tabungan — ${money(goalsTotalSaved())} terkumpul</h2>
      ${goals.map((g) => { const e = goalEta(g); return `
        <div style="padding:10px 0;border-top:1px solid var(--line)">
          <div class="goal-head"><b>${esc(g.name)}</b><span>${money(g.saved)} / ${money(g.target)}</span></div>
          <div class="bar thin" style="margin:8px 0"><i style="width:${(g.pct * 100).toFixed(0)}%;background:${g.color}"></i></div>
          <p class="eta">${formatPct(g.pct * 100)} · ETA ${formatMonths(e.months)} bln · ${e.transfers} transfers · selesai ${e.finish}</p>
        </div>`; }).join('')}
      <p style="margin-top:10px"><a href="#goals">Kelola tujuan &amp; setoran →</a></p>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <h2>Transaksi terakhir</h2>
    <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Amplop</th><th class="num">Jumlah</th></tr></thead><tbody>
    ${recent.map((t) => `<tr class="${t.kind}"><td>${t.date}</td><td>${esc(t.desc)}</td><td>${esc(t.category)}</td><td class="num amount">${signed(t)}</td></tr>`).join('')}
    </tbody></table></div>
    <p style="margin-top:12px"><a href="#transactions">Lihat 40 transaksi →</a></p>
  </div>`;
}

// --- Anggaran + What-if Planner ----------------------------------------------
function renderBudget() {
  const c = cashSummary();
  const rows = envelopeRows();
  const g = state.goals.find((x) => x.id === planner.goalId) || state.goals[0];
  const base = goalEta(g);
  const withExtra = goalEta(g, planner.extra);
  document.getElementById('view-budget').innerHTML = head(
    'Anggaran Amplop November',
    `Limit total ${money(ENVELOPE_LIMIT_TOTAL)} · terpakai ${money(c.spent)} · sisa ${money(c.remainingEnvelopes)}. Amplop dihitung dari transaksi — bukan angka yang dihafal.`,
  ) + `
  <div class="kpi-row">
    <div class="kpi"><p class="k-label">Penghasilan</p><p class="k-value">${money(c.income)}</p><p class="k-note">Arif ${money(8500000)} + Maya ${money(4000000)}</p></div>
    <div class="kpi"><p class="k-label">Terpakai</p><p class="k-value">${money(c.spent)}</p><p class="k-note">${formatPct(c.spent / c.income * 100)} dari penghasilan</p></div>
    <div class="kpi"><p class="k-label">Sisa Amplop</p><p class="k-value">${money(c.remainingEnvelopes)}</p><p class="k-note">Buffer belum dialokasikan ${money(c.buffer)}</p></div>
    <div class="kpi"><p class="k-label">Tabungan Nov</p><p class="k-value">${money(SAVINGS_NOV)}</p><p class="k-note">12% penghasilan</p></div>
  </div>
  <div class="grid g2">
    <div class="card"><h2>Enam amplop</h2>
      ${rows.map((e) => `
      <div class="env-row">
        <div class="env-top"><b><span style="color:${e.color}">●</span> ${esc(e.name)}</b><span class="env-nums"><strong>${money(e.spent)}</strong> / ${money(e.limit)}</span></div>
        <div class="bar" style="margin:8px 0"><i style="width:${Math.min(100, e.pct * 100).toFixed(0)}%;background:${e.color}" class="${e.pct > 1 ? 'over' : ''}"></i></div>
        <div class="env-meta"><span>Sisa ${money(e.remaining)} · ${formatPct(e.pct * 100)} terpakai</span><span>${e.pct > 0.9 ? '<span class="pill warn">Hampir habis</span>' : '<span class="pill">Aman</span>'}</span></div>
      </div>`).join('')}
    </div>
    <div>
      <div class="card">
        <h2>What-if Planner — percepat tujuan</h2>
        <p class="sub">Tambah setoran <b>bulanan</b> ke satu tujuan dan lihat ETA barunya. Tujuan wajib dipilih.</p>
        <form class="inline" id="planner-form">
          <label class="field">Tujuan (wajib)
            <select id="planner-goal">${state.goals.map((x) => `<option value="${x.id}" ${x.id === planner.goalId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
          </label>
          <label class="field">Tambahan per bulan (Rp)
            <input id="planner-extra" type="number" min="0" step="50000" value="${planner.extra}">
          </label>
          <button type="submit">Hitung ETA baru</button>
        </form>
        <div class="result" id="planner-result">
          <b>${esc(g.name)}</b> — setoran bulanan ${money(g.monthly)} → <b>${money(g.monthly + planner.extra)}</b><br>
          ETA lama: ${formatMonths(base.months)} bln · ${base.transfers} transfers · selesai ${base.finish}<br>
          ETA baru: <b>${formatMonths(withExtra.months)} bln · ${withExtra.transfers} transfers · selesai ${withExtra.finish}</b> — lebih cepat ${base.transfers - withExtra.transfers} transfer.
        </div>
        <p class="note" style="margin-top:10px">Sisa tujuan ${money(g.target - g.saved)} dibagi setoran bulanan baru. Contoh: tambahan ${money(500000)} ke Dana Darurat memangkas 9 transfer menjadi 6 transfer (selesai Mei 2027).</p>
      </div>
      <div class="card" style="margin-top:16px">
        <h2>Aturan amplop keluarga</h2>
        <p>1. Gajian masuk → tabungan ${money(SAVINGS_NOV)} dipindah dulu, baru belanja.</p>
        <p>2. Amplop habis = berhenti, pindah dari Buffer ${money(c.buffer)} hanya dengan persetujuan berdua.</p>
        <p>3. Sisa amplop akhir bulan otomatis jadi tambahan Dana Darurat.</p>
        <p style="margin-bottom:0">4. Tagihan dibayar dari amplop Rumah &amp; Tagihan — menandai lunas langsung mencatat pengeluarannya.</p>
      </div>
    </div>
  </div>`;
  document.getElementById('planner-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    planner.goalId = document.getElementById('planner-goal').value;
    planner.extra = Math.max(0, Number(document.getElementById('planner-extra').value) || 0);
    renderBudget();
  });
}

// --- Transaksi -----------------------------------------------------------------
let txnFilter = { envelope: 'all', q: '' };
function renderTransactions() {
  const list = state.transactions.filter((t) => {
    const okEnv = txnFilter.envelope === 'all' ? true
      : txnFilter.envelope === 'income' ? t.kind !== 'expense'
      : t.envelope === txnFilter.envelope;
    const okQ = !txnFilter.q || t.desc.toLowerCase().includes(txnFilter.q.toLowerCase());
    return okEnv && okQ;
  });
  const spent = list.filter((t) => t.kind === 'expense').reduce((a, t) => a + t.amount, 0);
  document.getElementById('view-transactions').innerHTML = head(
    'Transaksi November',
    `${state.transactions.length} transaksi: pemasukan ${money(12500000)}, pengeluaran ${money(8700000)}, transfer tabungan ${money(1500000)}.`,
  ) + `
  <div class="card" style="margin-bottom:16px">
    <h2>Catat pengeluaran baru</h2>
    <form class="inline" id="add-form">
      <label class="field">Keterangan <input id="add-desc" type="text" placeholder="cth. Pasar — sayur" required></label>
      <label class="field">Jumlah (Rp) <input id="add-amount" type="number" min="1000" step="1000" placeholder="50000" required></label>
      <label class="field">Amplop <select id="add-envelope">${envelopeRows().map((e) => `<option value="${e.id}">${esc(e.name)} (sisa ${money(e.remaining)})</option>`).join('')}</select></label>
      <button type="submit">Tambah transaksi</button>
    </form>
    <p class="note" id="add-note">Transaksi baru langsung mengurangi sisa amplop dan sisa kas November.</p>
  </div>
  <div class="toolbar">
    <label class="field">Amplop
      <select id="filter-envelope"><option value="all">Semua amplop</option>${envelopeRows().map((e) => `<option value="${e.id}" ${txnFilter.envelope === e.id ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}<option value="income" ${txnFilter.envelope === 'income' ? 'selected' : ''}>Pemasukan &amp; tabungan</option></select>
    </label>
    <label class="field">Cari <input id="filter-q" type="search" placeholder="cth. pasar" value="${esc(txnFilter.q)}"></label>
  </div>
  <p class="count-line">Menampilkan ${list.length} dari ${state.transactions.length} transaksi · pengeluaran yang tampil: ${money(spent)}</p>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Amplop</th><th class="num">Jumlah</th></tr></thead>
    <tbody>${list.map((t) => `<tr class="${t.kind}"><td>${t.date}</td><td>${esc(t.desc)}</td><td>${esc(t.category)}</td><td class="num amount">${signed(t)}</td></tr>`).join('') || '<tr><td colspan="4">Tidak ada transaksi yang cocok.</td></tr>'}</tbody>
  </table></div></div>`;
  document.getElementById('add-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const ok = addTransaction(
      document.getElementById('add-desc').value.trim(),
      Number(document.getElementById('add-amount').value),
      document.getElementById('add-envelope').value,
    );
    document.getElementById('add-note').textContent = ok
      ? `Tersimpan: ${ok.desc} ${money(ok.amount)} ke amplop ${ok.category}.`
      : 'Gagal menyimpan — isi keterangan, jumlah, dan amplop.';
    if (ok) renderTransactions();
  });
  document.getElementById('filter-envelope').addEventListener('change', (ev) => {
    txnFilter.envelope = ev.target.value;
    renderTransactions();
  });
  document.getElementById('filter-q').addEventListener('input', (ev) => { txnFilter.q = ev.target.value; renderTransactions(); });
}

// --- Tagihan -------------------------------------------------------------------
function renderBills() {
  const b = billsSummary();
  document.getElementById('view-bills').innerHTML = head(
    'Tagihan November',
    `Total jatuh tempo ${money(b.due)} · sudah dibayar ${money(b.paid)} · masih menunggu ${money(b.upcomingTotal)}. Menandai lunas langsung mencatat pengeluarannya di amplop Rumah &amp; Tagihan.`,
  ) + `
  <div class="kpi-row">
    <div class="kpi"><p class="k-label">Total jatuh tempo</p><p class="k-value">${money(b.due)}</p><p class="k-note">6 tagihan bulan ini</p></div>
    <div class="kpi"><p class="k-label">Sudah dibayar</p><p class="k-value">${money(b.paid)}</p><p class="k-note">5 dari 6 tagihan lunas</p></div>
    <div class="kpi"><p class="k-label">Akan datang</p><p class="k-value">${money(b.upcomingTotal)}</p><p class="k-note">Internet, 28 Nov 2026</p></div>
  </div>
  <div class="grid g2">
    <div class="card"><h2>Daftar tagihan</h2>
      ${state.bills.map((x) => `
      <div class="bill-row">
        <div><b>${esc(x.name)}</b><p class="sub">${esc(x.detail)}</p><p class="sub">Jatuh tempo ${esc(x.due)}${x.paid && x.paidDate ? ' · dibayar ' + esc(x.paidDate) : ''}</p></div>
        <div style="text-align:right"><p class="amount">${money(x.amount)}</p>
        ${x.paid ? '<span class="pill done">Lunas ✓</span>' : `<button class="small" data-pay="${x.id}">Tandai lunas</button>`}
        </div>
      </div>`).join('')}
    </div>
    <div>
      <div class="card">
        <h2>Utang — ${esc(DEBT.name)}</h2>
        <p class="label">Sisa utang</p><p class="big">${money(state.debt.remaining)}</p>
        <p class="sub">${state.debt.installmentsLeft} cicilan × ${money(state.debt.installment)} · cicilan berikutnya ${esc(state.debt.nextDue)}</p>
        <div class="bar"><i style="width:20%"></i></div>
        <p class="note" style="margin-top:8px">Sudah lunas 2 dari 10 cicilan (20%). Cicilan dibayar tiap tanggal 5 bersama sewa rumah.</p>
      </div>
      <div class="callout" style="margin-top:16px"><p><b>Pengingat:</b> Internet Rp330.000 jatuh tempo 28 Nov — besok. Tandai lunas begitu dibayar supaya amplop Rumah &amp; Tagihan tetap akurat.</p></div>
    </div>
  </div>`;
  document.querySelectorAll('[data-pay]').forEach((btn) => btn.addEventListener('click', () => {
    markBillPaid(btn.dataset.pay);
    renderBills();
  }));
}

// --- Tujuan --------------------------------------------------------------------
function renderGoals() {
  const goals = goalsSummary();
  document.getElementById('view-goals').innerHTML = head(
    'Tujuan Tabungan',
    `Total terkumpul ${money(goalsTotalSaved())} dari target ${money(24000000)}. Setoran bulanan berjalan: Dana Darurat ${money(1000000)}/bulan, Dana Sekolah ${money(500000)}/bulan.`,
  ) + `
  <div class="grid g2">
    ${goals.map((g) => { const e = goalEta(g); return `
    <div class="card goal-card">
      <div class="goal-head"><h2>${esc(g.name)}</h2><span class="pill">${formatPct(g.pct * 100)}</span></div>
      <p class="sub">${esc(g.note)}</p>
      <div class="goal-nums"><span>Terkumpul <strong>${money(g.saved)}</strong></span><span>Target <strong>${money(g.target)}</strong></span></div>
      <div class="bar"><i style="width:${(g.pct * 100).toFixed(0)}%;background:${g.color}"></i></div>
      <p class="eta" style="margin-top:10px">ETA ${formatMonths(e.months)} bln · ${e.transfers} transfers · selesai ${e.finish}<small>Setoran ${money(g.monthly)}/bulan · sisa ${money(g.remaining)}</small></p>
      <form class="inline deposit-form" data-goal="${g.id}" style="margin-top:12px">
        <label class="field">Setoran tambahan (Rp) <input type="number" min="10000" step="10000" placeholder="100000" required></label>
        <button type="submit" class="small">Setor sekarang</button>
      </form>
      <p class="note deposit-note"></p>
    </div>`; }).join('')}
  </div>
  <div class="card" style="margin-top:16px">
    <h2>Rencana setoran bulanan</h2>
    <p>Setoran November sudah masuk: Dana Darurat ${money(900000)} dan Dana Sekolah ${money(600000)} pada 5 Nov — total ${money(SAVINGS_NOV)} (12% penghasilan).</p>
    <p style="margin-bottom:0">Mau lebih cepat selesai? Buka <a href="#budget">What-if Planner di halaman Anggaran</a> — pilih tujuan, tambah setoran bulanan, dan lihat ETA barunya.</p>
  </div>`;
  document.querySelectorAll('.deposit-form').forEach((f) => f.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const amount = Number(f.querySelector('input').value);
    const res = depositToGoal(f.dataset.goal, amount);
    const note = f.parentElement.querySelector('.deposit-note');
    if (res) { note.textContent = `Tersimpan ${money(res.amount)}. Saldo baru ${money(res.goal.saved)} — ETA baru ${formatMonths(res.eta.months)} bln, selesai ${res.eta.finish}.`; renderGoals(); }
    else note.textContent = 'Setoran gagal — jumlah harus lebih dari Rp0 dan tidak melebihi sisa target.';
  }));
}

// --- Laporan -------------------------------------------------------------------
function renderReports() {
  const c = cashSummary();
  document.getElementById('view-reports').innerHTML = head(
    'Laporan November',
    'Empat bulan terakhir, perbandingan kategori, dan tiga tips hemat untuk keluarga ini.',
  ) + `
  <div class="kpi-row">
    <div class="kpi"><p class="k-label">Tingkat tabungan</p><p class="k-value">${formatPct(savingsRateNov() * 100)}</p><p class="k-note">Target keluarga: 15%</p></div>
    <div class="kpi"><p class="k-label">Belanja vs Oktober</p><p class="k-value">−${money(10300000 - c.spent)}</p><p class="k-note">Okt Rp10.300.000 → Nov ${money(c.spent)}</p></div>
    <div class="kpi"><p class="k-label">Amplop paling boros</p><p class="k-value">Rumah</p><p class="k-note">${money(5370000)} — 62% belanja</p></div>
  </div>
  <div class="grid g2">
    <div class="card">
      <h2>Penghasilan vs belanja — Agu–Nov</h2>
      <div class="chart">${historyRows().map((h) => `
        <div class="chart-col"><div class="chart-bars">
          <i class="inc" style="height:${Math.round(h.income / 125000)}px" title="Penghasilan ${money(h.income)}"></i>
          <i class="out" style="height:${Math.round(h.spent / 125000)}px" title="Belanja ${money(h.spent)}"></i>
        </div><p class="m">${h.month}</p><p class="v">${formatIDRCompact(h.income)} masuk<br>${formatIDRCompact(h.spent)} keluar<br>Sisa ${formatIDRCompact(h.saved)}</p></div>`).join('')}
      </div>
      <p class="legend"><span><i style="background:var(--green)"></i>Penghasilan</span><span><i style="background:var(--amber)"></i>Belanja</span></p>
      <p class="note" style="margin-top:10px">November adalah bulan paling hemat: belanja ${formatIDRCompact(8700000)}, turun ${formatIDRCompact(1600000)} dari Oktober. September tetap bulan dengan belanja terendah kedua: ${formatIDRCompact(9850000)}.</p>
    </div>
    <div class="card">
      <h2>Belanja per amplop</h2>
      ${envelopeRows().sort((a, b) => b.spent - a.spent).map((e) => `
      <div class="env-row"><div class="env-top"><b>${esc(e.name)}</b><span class="env-nums"><strong>${money(e.spent)}</strong> · ${formatPct(e.spent / c.spent * 100)}</span></div>
      <div class="bar thin" style="margin:7px 0"><i style="width:${(e.spent / c.spent * 100).toFixed(1)}%;background:${e.color}"></i></div></div>`).join('')}
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <h2>Tips hemat bulan ini</h2>
    ${TIPS.map((t) => `<div class="tip"><b>${esc(t.title)}</b><p class="muted" style="margin:4px 0 0">${esc(t.body)}</p></div>`).join('')}
  </div>`;
}

// --- Pengaturan ------------------------------------------------------------------
function renderSettings() {
  document.getElementById('view-settings').innerHTML = head(
    'Pengaturan',
    'Anggota keluarga, penghasilan, dan data demo bulan ini.',
  ) + `
  <div class="grid g2">
    <div class="card">
      <h2>Keluarga</h2>
      ${HOUSEHOLD.members.map((m) => `<div class="bill-row"><div><b>${esc(m.name)}</b><p class="sub">${esc(m.role)}</p></div><p class="amount">${money(m.income)}/bulan</p></div>`).join('')}
      <p class="note">Total penghasilan ${money(INCOME_TOTAL)} per bulan. Bulan berjalan: ${esc(HOUSEHOLD.month)}.</p>
    </div>
    <div class="card">
      <h2>Data demo</h2>
      <p>Semua angka berasal dari 40 transaksi November 2026 yang tercatat di aplikasi ini. Perubahan yang kamu buat (tambah transaksi, tandai tagihan lunas, setoran tujuan) hanya berlaku selama halaman ini dibuka.</p>
      <button id="reset-btn" class="ghost">Reset ke data awal November</button>
      <p class="note" id="reset-note" style="margin-top:10px"></p>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <h2>Tentang Saku Serambi</h2>
    <p>“Make room for what matters.” Saku Serambi adalah buku kas keluarga: amplop untuk belanja, pengingat tagihan, dan tujuan tabungan — tanpa akun, tanpa iklan, tanpa data yang keluar dari perangkatmu.</p>
    <p style="margin-bottom:0">Dibuat untuk Keluarga Arif &amp; Maya · November 2026 · Mata uang Rupiah (IDR).</p>
  </div>`;
  document.getElementById('reset-btn').addEventListener('click', () => {
    resetState();
    document.getElementById('reset-note').textContent = 'Data dikembalikan ke awal November 2026: 40 transaksi, tagihan Internet belum lunas.';
  });
}

window.addEventListener('hashchange', route);
route();
