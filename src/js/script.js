// ===== APP STATE =====
let appState = {
    income: {}, expenses: {}, netSavings: 0, savingsRate: 0,
    assets: [], liabilities: [], goals: []
};

// ===== UTILITIES =====
function formatINR(n) {
    if (isNaN(n)) return '₹0';
    const abs = Math.abs(n);
    let str;
    if (abs >= 10000000) str = '₹' + (abs / 10000000).toFixed(2) + ' Cr';
    else if (abs >= 100000) str = '₹' + (abs / 100000).toFixed(1) + ' L';
    else str = '₹' + abs.toLocaleString('en-IN');
    return n < 0 ? '-' + str : str;
}

function showAutoSave(text) {
    const el = document.getElementById('autoSaveIndicator');
    const textEl = document.getElementById('autoSaveIndicatorText');
    if (!el) return;
    if (textEl) textEl.textContent = text || 'Auto-saved';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 2500);
}

// ===== PAGE NAVIGATION =====
function goToPage(pageNum) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page' + pageNum);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-step').forEach((step, idx) => {
        const circle = step.querySelector('.nav-step-circle');
        const label = step.querySelector('.nav-step-label');
        const n = idx + 1;
        if (n === pageNum) {
            circle.className = 'w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/30 ring-4 ring-white dark:ring-[#151c2b] transition-all nav-step-circle';
            if (label) { label.classList.add('font-bold', 'text-slate-700'); label.classList.remove('text-slate-500'); }
        } else if (n < pageNum) {
            circle.className = 'w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold ring-4 ring-white dark:ring-[#151c2b] transition-all nav-step-circle';
        } else {
            circle.className = 'w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold ring-4 ring-white dark:ring-[#151c2b] transition-all nav-step-circle';
            if (label) { label.classList.remove('font-bold', 'text-slate-700'); label.classList.add('text-slate-500'); }
        }
    });
    if (pageNum === 1) updateCalculations();
    if (pageNum === 3) { renderAgeMarkers(); renderTimeline(); }
}

// ===== AMOUNT SLIDERS =====
function initSliders() {
    document.querySelectorAll('.amount-slider').forEach(slider => {
        const input = slider.querySelector('input[type="range"]');
        const fill = slider.querySelector('.slider-fill');
        const isPercent = slider.dataset.type === 'percent';
        if (input && fill) {
            input.addEventListener('input', function () {
                fill.textContent = isPercent ? this.value + '%' : '₹' + parseInt(this.value).toLocaleString('en-IN');
                updateCalculations();
            });
        }
    });
}

function getSliderValue(field) {
    const el = document.querySelector(`.amount-slider[data-field="${field}"] input`);
    return el ? parseInt(el.value) || 0 : 0;
}

function updateCalculations() {
    const salary = getSliderValue('salary');
    const bonus = getSliderValue('bonus');
    const rental = getSliderValue('rental');
    const business = getSliderValue('business');
    const investment = getSliderValue('investment');
    const otherIncome = getSliderValue('otherIncome');
    const annualIncome = (salary + rental + business + investment + otherIncome) * 12 + bonus;

    const rent = getSliderValue('rent');
    const schoolFees = getSliderValue('schoolFees');
    const household = getSliderValue('household');
    const emis = getSliderValue('emis');
    const vacation = getSliderValue('vacation');
    const discretionary = getSliderValue('discretionary');
    const lifeInsurance = getSliderValue('lifeInsurance');
    const healthInsurance = getSliderValue('healthInsurance');
    const maintenance = getSliderValue('maintenance');
    const annualExpenses = (rent + schoolFees + household + emis) * 12 + vacation + discretionary + lifeInsurance + healthInsurance + maintenance;

    const netSavings = annualIncome - annualExpenses;
    const savingsRate = annualIncome > 0 ? ((netSavings / annualIncome) * 100).toFixed(1) : 0;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('netSavings', formatINR(netSavings));
    set('totalIncome', formatINR(annualIncome));
    set('totalExpenses', formatINR(annualExpenses));
    set('savingsRateText', savingsRate + '%');
    set('dashMonthlyCont', formatINR(Math.round(netSavings / 12)));

    const vault = document.getElementById('vault');
    if (vault) vault.textContent = savingsRate > 30 ? 'lock_open' : 'lock';

    appState.income = { salary, bonus, rental, business, investment, otherIncome, annualIncome };
    appState.expenses = { rent, schoolFees, household, emis, vacation, discretionary, lifeInsurance, healthInsurance, maintenance, annualExpenses };
    appState.netSavings = netSavings;
    appState.savingsRate = parseFloat(savingsRate);
}

// ===== BALANCE SHEET =====
function showInlineForm(type) {
    document.getElementById('inlineForm')?.remove();
    const isAsset = type === 'asset';
    const categories = isAsset
        ? ['Savings Account', 'Fixed Deposit', 'Mutual Funds', 'Stocks', 'Real Estate', 'Gold', 'PPF / EPF', 'Other']
        : ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Other'];

    const form = document.createElement('div');
    form.id = 'inlineForm';
    form.className = `mt-4 p-4 rounded-xl border-2 ${isAsset ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10' : 'border-red-300 bg-red-50 dark:bg-red-900/10'}`;
    form.innerHTML = `
        <p class="text-sm font-bold mb-3 ${isAsset ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}">Add ${isAsset ? 'Asset' : 'Liability'}</p>
        <div class="grid grid-cols-1 gap-3">
            <select id="formCategory" class="w-full rounded-lg border border-slate-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white">
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <input id="formName" type="text" placeholder="Name (e.g. HDFC Savings)" class="w-full rounded-lg border border-slate-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white">
            <input id="formValue" type="number" placeholder="Value in ₹" class="w-full rounded-lg border border-slate-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white">
        </div>
        <div class="flex gap-2 mt-3">
            <button onclick="saveBalanceItem('${type}')" class="px-4 py-2 rounded-lg ${isAsset ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white text-sm font-semibold transition-colors">Add</button>
            <button onclick="document.getElementById('inlineForm').remove()" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 text-sm font-semibold">Cancel</button>
        </div>`;

    const btn = document.querySelector(`[onclick="showInlineForm('${type}')"]`);
    if (btn) btn.parentNode.insertBefore(form, btn);
    document.getElementById('formName')?.focus();
}

function saveBalanceItem(type) {
    const isAsset = type === 'asset';
    const category = document.getElementById('formCategory').value;
    const name = document.getElementById('formName').value.trim() || category;
    const value = parseInt(document.getElementById('formValue').value) || 0;
    if (value <= 0) { alert('Please enter a valid value greater than 0.'); return; }

    const item = { id: Date.now(), category, name, value };
    if (isAsset) { appState.assets.push(item); renderBalanceList('asset'); }
    else { appState.liabilities.push(item); renderBalanceList('liability'); }

    document.getElementById('inlineForm')?.remove();
    updateNetWorth();
    persistState();
    showAutoSave();
}

function renderBalanceList(type) {
    const isAsset = type === 'asset';
    const list = isAsset ? appState.assets : appState.liabilities;
    const container = document.getElementById(isAsset ? 'assetsList' : 'liabilitiesList');
    const totalEl = document.getElementById(isAsset ? 'totalAssets' : 'totalLiabilities');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-slate-400"><div class="text-5xl mb-3 opacity-20">${isAsset ? '💰' : '💳'}</div><div class="text-sm font-medium">No ${isAsset ? 'assets' : 'liabilities'} added yet</div></div>`;
        if (totalEl) totalEl.textContent = '₹0';
        return;
    }

    const total = list.reduce((s, i) => s + i.value, 0);
    if (totalEl) totalEl.textContent = formatINR(total);

    container.innerHTML = list.map(item => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-gray-900/40 border border-slate-100 dark:border-gray-800">
            <div class="flex-1 min-w-0 mr-3">
                <p class="font-semibold text-sm text-slate-900 dark:text-white truncate">${item.name}</p>
                <p class="text-xs text-slate-500">${item.category}</p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <span class="font-bold text-sm ${isAsset ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">${formatINR(item.value)}</span>
                <button onclick="deleteBalanceItem('${type}',${item.id})" class="text-slate-300 hover:text-red-500 transition-colors text-sm font-bold">✕</button>
            </div>
        </div>`).join('');
}

function deleteBalanceItem(type, id) {
    if (type === 'asset') appState.assets = appState.assets.filter(i => i.id !== id);
    else appState.liabilities = appState.liabilities.filter(i => i.id !== id);
    renderBalanceList(type);
    updateNetWorth();
    persistState();
}

function updateNetWorth() {
    const assets = appState.assets.reduce((s, i) => s + i.value, 0);
    const liabilities = appState.liabilities.reduce((s, i) => s + i.value, 0);
    const el = document.getElementById('netWorth');
    if (el) el.textContent = formatINR(assets - liabilities);
    const savedEl = document.getElementById('dashTotalSaved');
    if (savedEl) savedEl.textContent = formatINR(assets);
}

// ===== GOAL TIMELINE =====
let timelineGoals = [];
let selectedGoalId = null;
let dragGoalData = null;

function initTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    const start = document.getElementById('characterStart');
    const end = document.getElementById('characterEnd');
    if (start) { start.style.left = '40px'; start.style.bottom = '40px'; }
    if (end) { end.style.right = '40px'; end.style.bottom = '40px'; }

    container.addEventListener('dragover', e => { e.preventDefault(); container.classList.add('ring-2', 'ring-primary'); });
    container.addEventListener('dragleave', () => container.classList.remove('ring-2', 'ring-primary'));
    container.addEventListener('drop', e => {
        e.preventDefault();
        container.classList.remove('ring-2', 'ring-primary');
        if (!dragGoalData) return;
        const rect = container.getBoundingClientRect();
        const xPct = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
        const yPct = Math.max(0.1, Math.min(0.85, (e.clientY - rect.top) / rect.height));
        const currentAge = parseInt(document.getElementById('currentAge')?.textContent || '32');
        const age = Math.round(currentAge + xPct * (75 - currentAge));
        const year = new Date().getFullYear() + (age - currentAge);
        const goal = { id: Date.now(), ...dragGoalData, age, year, xPct, yPct };
        timelineGoals.push(goal);
        renderTimeline();
        updateGoalStats();
        document.getElementById('timelineEmptyState')?.classList.add('hidden');
        populateGoalEditor(goal);
        dragGoalData = null;
        persistState();
    });

    document.querySelectorAll('.goal-icon-item').forEach(item => {
        item.addEventListener('dragstart', () => {
            dragGoalData = {
                icon: item.dataset.goalIcon,
                name: item.dataset.goalName,
                type: item.dataset.goalType,
                budget: parseFloat(item.dataset.goalBudget) || 0
            };
        });
    });

    document.getElementById('goalSaveBtn')?.addEventListener('click', saveSelectedGoal);
    document.getElementById('goalCancelBtn')?.addEventListener('click', clearGoalEditor);
    document.getElementById('goalDeleteBtn')?.addEventListener('click', deleteSelectedGoal);

    renderAgeMarkers();
}

function renderAgeMarkers() {
    const container = document.getElementById('ageMarkers');
    if (!container) return;
    const currentAge = parseInt(document.getElementById('currentAge')?.textContent || '32');
    const ages = [currentAge, currentAge + 10, currentAge + 20, currentAge + 30, 75];
    container.innerHTML = ages.map((age, i) => {
        const xPct = (i / (ages.length - 1)) * 100;
        return `<span class="age-marker absolute" style="left:${xPct}%;bottom:4px;transform:translateX(-50%)">Age ${age}</span>`;
    }).join('');
}

function renderTimeline() {
    document.querySelectorAll('.goal-on-timeline').forEach(el => el.remove());
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    timelineGoals.forEach(goal => {
        const el = document.createElement('div');
        el.className = 'goal-on-timeline' + (goal.id === selectedGoalId ? ' selected' : '');
        el.setAttribute('tabindex', '0');
        el.dataset.goalId = goal.id;
        el.style.left = (goal.xPct * 100) + '%';
        el.style.top = (goal.yPct * 100) + '%';
        el.innerHTML = `
            <button class="goal-delete-btn" onclick="deleteGoalById(${goal.id},event)">✕</button>
            <div class="goal-chip">
                <div class="goal-chip-icon">${goal.icon}</div>
                <div>
                    <div class="goal-chip-name">${goal.name}</div>
                    <div class="goal-chip-sub">Age ${goal.age} · ₹${goal.budget}L</div>
                </div>
            </div>`;
        el.addEventListener('click', () => { selectedGoalId = goal.id; renderTimeline(); populateGoalEditor(goal); });
        container.appendChild(el);
    });
}

function deleteGoalById(id, e) {
    if (e) e.stopPropagation();
    timelineGoals = timelineGoals.filter(g => g.id !== id);
    if (selectedGoalId === id) { selectedGoalId = null; clearGoalEditor(); }
    renderTimeline();
    updateGoalStats();
    if (timelineGoals.length === 0) document.getElementById('timelineEmptyState')?.classList.remove('hidden');
    persistState();
}

function updateGoalStats() {
    const el = id => document.getElementById(id);
    if (el('timelineTotalGoals')) el('timelineTotalGoals').textContent = timelineGoals.length;
    const total = timelineGoals.reduce((s, g) => s + (g.budget || 0), 0);
    if (el('timelineTotalBudget')) el('timelineTotalBudget').textContent = '₹' + total + 'L';
    const sorted = [...timelineGoals].sort((a, b) => a.year - b.year);
    if (el('timelineNextMilestone')) el('timelineNextMilestone').textContent = sorted[0] ? sorted[0].year : '--';
    if (el('dashActiveGoals')) el('dashActiveGoals').textContent = timelineGoals.length;
}

function populateGoalEditor(goal) {
    document.getElementById('goalEditorTitle').textContent = 'Edit: ' + goal.name;
    document.getElementById('goalEditorHint').textContent = 'Editing selected goal';
    document.getElementById('goalNameInput').value = goal.name;
    document.getElementById('goalIconInput').value = goal.icon;
    document.getElementById('goalYearInput').value = goal.year;
    document.getElementById('goalBudgetInput').value = goal.budget;
    document.getElementById('goalDeleteBtn')?.classList.remove('hidden');
    selectedGoalId = goal.id;

    const isEdu = goal.type === 'education';
    const isTravel = goal.type === 'travel';
    ['goalYearLabel', 'goalBudgetLabel'].forEach(id => document.getElementById(id)?.classList.toggle('hidden', isEdu || isTravel));
    ['eduAdmissionYearLabel', 'eduFeeBudgetLabel'].forEach(id => document.getElementById(id)?.classList.toggle('hidden', !isEdu));
    ['travelAnnualBudgetLabel', 'travelStartYearLabel', 'travelEndYearLabel'].forEach(id => document.getElementById(id)?.classList.toggle('hidden', !isTravel));
}

function saveSelectedGoal() {
    if (!selectedGoalId) { alert('Select a goal on the timeline first.'); return; }
    const goal = timelineGoals.find(g => g.id === selectedGoalId);
    if (!goal) return;
    goal.name = document.getElementById('goalNameInput').value || goal.name;
    goal.icon = document.getElementById('goalIconInput').value || goal.icon;
    goal.year = parseInt(document.getElementById('goalYearInput').value) || goal.year;
    goal.budget = parseFloat(document.getElementById('goalBudgetInput').value) || goal.budget;
    renderTimeline();
    updateGoalStats();
    showAutoSave('Goal updated');
    persistState();
}

function deleteSelectedGoal() { if (selectedGoalId) deleteGoalById(selectedGoalId); }

function clearGoalEditor() {
    document.getElementById('goalEditorTitle').textContent = 'Add a milestone';
    document.getElementById('goalEditorHint').textContent = 'Select a goal to edit or drag a new one';
    ['goalNameInput', 'goalIconInput', 'goalYearInput', 'goalBudgetInput'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('goalDeleteBtn')?.classList.add('hidden');
    selectedGoalId = null;
    renderTimeline();
}

// ===== DATA CONTROLS =====
function persistState() {
    try { appState.goals = timelineGoals; localStorage.setItem('intelliwealth_state', JSON.stringify(appState)); } catch (e) {}
}

function saveAllData() {
    updateCalculations();
    persistState();
    showAutoSave('Plan saved!');
    alert('Plan saved successfully to browser storage!');
}

function exportData() {
    updateCalculations();
    persistState();
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'intelliwealth_plan.json'; a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                appState = { ...appState, ...data };
                renderBalanceList('asset');
                renderBalanceList('liability');
                updateNetWorth();
                timelineGoals = appState.goals || [];
                renderTimeline();
                updateGoalStats();
                showAutoSave('Data imported!');
                alert('Data imported successfully!');
            } catch { alert('Invalid file format. Please use a valid IntelliWealth JSON file.'); }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

function clearAllData() {
    if (!confirm('Clear all data? This cannot be undone.')) return;
    appState = { income: {}, expenses: {}, netSavings: 0, savingsRate: 0, assets: [], liabilities: [], goals: [] };
    timelineGoals = [];
    localStorage.removeItem('intelliwealth_state');
    renderBalanceList('asset');
    renderBalanceList('liability');
    updateNetWorth();
    renderTimeline();
    updateGoalStats();
    document.getElementById('timelineEmptyState')?.classList.remove('hidden');
    showAutoSave('Data cleared');
}

// ===== LOAD SAVED STATE =====
function loadSavedState() {
    try {
        const saved = localStorage.getItem('intelliwealth_state');
        if (!saved) return;
        const state = JSON.parse(saved);
        appState = { ...appState, ...state };
        if (appState.assets?.length) renderBalanceList('asset');
        if (appState.liabilities?.length) renderBalanceList('liability');
        updateNetWorth();
        if (appState.goals?.length) {
            timelineGoals = appState.goals;
            renderTimeline();
            updateGoalStats();
            document.getElementById('timelineEmptyState')?.classList.add('hidden');
        }
    } catch (e) {}
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initSliders();
    updateCalculations();
    initTimeline();
    loadSavedState();
    setInterval(persistState, 15000);
});
