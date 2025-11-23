const KEY = 'kristalMinimalThemeV7'; const saved = localStorage.getItem(KEY); if (saved) document.documentElement.setAttribute('data-theme', saved);
// document.getElementById('themeToggle').addEventListener('click', () => { const cur = document.documentElement.getAttribute('data-theme') || 'light'; const next = cur === 'light' ? 'dark' : 'light'; document.documentElement.setAttribute('data-theme', next); localStorage.setItem(KEY, next); });

const $ = s => document.querySelector(s); const money = n => { const v = Math.max(0, Math.round(Number(n) || 0)); return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }; const unmoney = s => Number(String(s).replace(/,/g, '')) || 0;

document.querySelectorAll('[data-step]').forEach(btn => { btn.addEventListener('click', () => { const id = btn.getAttribute('data-step'); const delta = Number(btn.getAttribute('data-delta')); const el = $('#' + id); if (!el) return; el.value = Number(el.value || 0) + delta; if (el.min) el.value = Math.max(Number(el.min), Number(el.value)); }); });

function bindPair(txtId, rangeId, isMoney = true) { const T = $('#' + txtId), R = $('#' + rangeId); if (!T || !R) return; T.value = isMoney ? money(R.value) : R.value; T.addEventListener('input', () => { const v = isMoney ? unmoney(T.value) : Number(T.value || 0); R.value = Math.min(R.max, Math.max(R.min, v)); if (isMoney) T.value = money(R.value); }); R.addEventListener('input', () => { T.value = isMoney ? money(R.value) : R.value; }); }
bindPair('invest_now', 's_invest_now', true);
bindPair('save_pa', 's_save_pa', true);
bindPair('ret_exp', 's_ret_exp', true);
bindPair('legacy', 's_legacy', true);
bindPair('infl', 's_infl', false);
bindPair('save_g', 's_save_g', false);
bindPair('rent_pa', 's_rent_pa', true);
bindPair('loan_tenure', 's_loan_tenure', false);
bindPair('downpay', 's_downpay', true);
bindPair('emi_pa', 's_emi_pa', true);
bindPair('edu_cost_pa', 's_edu_cost_pa', true);

// ===== Auto-calculation logic (INR) =====
(function () {
    const $ = (s) => document.querySelector(s);
    const parseNum = (s) => Number(String(s).replace(/[^0-9.\-]/g, '')) || 0;
    const fmtINR = (n) => {
        const x = Math.round(n);
        return (x < 0 ? '-' : '') + '₹' + Math.abs(x).toLocaleString('en-IN');
    };
    function v(id) { const el = document.getElementById(id); return el ? parseNum(el.value) : 0; }

    function recalc() {
        // Gross monthly income
        const gmi = v('inc_takehome') + (v('inc_bonus') + v('inc_rent') + v('inc_business') + v('inc_invest') + v('inc_other')) / 12;

        // Non-debt monthly expenses
        const rentMonthly = v('exp_rent') || (v('rent_pa') / 12);
        const me = rentMonthly + v('exp_school') + v('exp_household');

        // Monthly debt payments (all EMIs + home EMI from annual)
        const md = v('loan_home_emi') + v('loan_car_emi') + v('loan_personal_emi') + v('loan_edu_emi') + v('loan_biz_emi') + v('loan_other_emi') + (v('emi_pa') / 12);

        const nms = gmi - me - md;
        const nas = nms * 12;
        const sr = gmi > 0 ? (nms / gmi) * 100 : 0;
        const dti = gmi > 0 ? (md / gmi) * 100 : 0;

        // Net worth = assets - liabilities
        const assets = v('invest_now') + v('inv_mf') + v('inv_stocks') + v('inv_bonds_fd') + v('inv_ppf_epf_nps') + v('inv_savings_bank') + v('inv_realestate') + v('inv_gold') + v('inv_other') + v('inv_any_other_5lac');
        const liabilities = v('loan_home_out') + v('loan_car_out') + v('loan_personal_out') + v('loan_edu_out') + v('loan_biz_out') + v('loan_other_out');
        const nw = assets - liabilities;

        // Update tiles (if they exist)
        if ($('#t_gmi')) $('#t_gmi').textContent = fmtINR(gmi);
        if ($('#t_me')) $('#t_me').textContent = fmtINR(me);
        if ($('#t_md')) $('#t_md').textContent = fmtINR(md);
        if ($('#t_nms')) $('#t_nms').textContent = fmtINR(nms);
        if ($('#t_nas')) $('#t_nas').textContent = fmtINR(nas);
        if ($('#t_sr')) $('#t_sr').textContent = sr.toFixed(1) + '%';
        if ($('#t_dti')) $('#t_dti').textContent = dti.toFixed(1) + '%';
        if ($('#t_nw')) $('#t_nw').textContent = fmtINR(nw);
    }

    // Wire up
    document.querySelectorAll('input,select').forEach(el => {
        el.addEventListener('input', recalc);
    });
    // Recalc initially
    recalc();
})();
