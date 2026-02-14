// ===== LOCAL STORAGE & DATA PERSISTENCE =====
const STORAGE_KEY = 'intelliwealth_enhanced_data';

// Load all data from localStorage
function loadAllData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);

            // Load Page 1: Sliders
            if (data.sliders) {
                Object.keys(data.sliders).forEach(field => {
                    const slider = document.querySelector(`[data-field="${field}"]`);
                    if (slider) {
                        slider.dataset.value = data.sliders[field];
                        const fill = slider.querySelector('.slider-fill');
                        const maxValue = parseInt(slider.dataset.max);
                        const percentage = (data.sliders[field] / maxValue) * 100;
                        fill.style.width = percentage + '%';

                        if (slider.dataset.type === 'percent') {
                            fill.textContent = data.sliders[field] + '%';
                        } else {
                            fill.textContent = '₹' + parseInt(data.sliders[field]).toLocaleString('en-IN');
                        }
                    }
                });
                calculateTotals();
            }

            // Load Page 2: Assets & Liabilities
            if (data.balance) {
                droppedItems.liabilities = data.balance.liabilities || [];
                droppedItems.assets = data.balance.assets || [];

                // ENHANCEMENT: Add default icons/categories to legacy items for backward compatibility
                droppedItems.assets.forEach(item => {
                    if (!item.icon) item.icon = '💰';
                    if (!item.category) item.category = 'other';
                });

                droppedItems.liabilities.forEach(item => {
                    if (!item.icon) item.icon = '💳';
                    if (!item.category) item.category = 'other';
                });

                updateBalanceSheet();
            } else {
                // No saved balance data — populate with default categories
                populateDefaults();
            }

            // Load Page 3: Timeline goals
            if (data.timeline) {
                if (data.timeline.currentAge) {
                    document.getElementById('currentAge').textContent = data.timeline.currentAge;
                }
                if (data.timeline.gender !== undefined) {
                    document.getElementById('genderToggle').checked = data.timeline.gender;
                    toggleGender();
                }
                if (data.timeline.goals) {
                    data.timeline.goals.forEach(goalData => {
                        addSavedGoalToTimeline(goalData);
                    });
                }
            }

            // Load gamification data
            if (data.gamification) {
                updateGamificationUI(data.gamification);
            }

            console.log('✓ Data loaded from localStorage');
        } catch (error) {
            console.error('Error loading data:', error);
        }
    } else {
        // No saved data at all — populate defaults
        populateDefaults();
    }
}

// Save all data to localStorage
function saveAllData() {
    const data = {
        version: '2.0-enhanced',
        timestamp: new Date().toISOString(),
        sliders: {},
        balance: {
            liabilities: droppedItems.liabilities,
            assets: droppedItems.assets
        },
        timeline: {
            currentAge: parseInt(document.getElementById('currentAge').textContent),
            gender: document.getElementById('genderToggle').checked,
            goals: []
        },
        gamification: calculateGamificationStats()
    };

    // Save Page 1: All sliders
    document.querySelectorAll('.amount-slider').forEach(slider => {
        const field = slider.dataset.field;
        if (field) {
            data.sliders[field] = slider.dataset.value;
        }
    });

    // Save Page 3: Timeline goals
    document.querySelectorAll('.goal-on-timeline').forEach(goal => {
        const goalIcon = goal.dataset.goalIcon || goal.querySelector('.goal-chip-icon')?.textContent?.trim() || '';
        const goalName = goal.dataset.goalName || goal.querySelector('.goal-chip-name')?.textContent?.trim() || '';
        data.timeline.goals.push({
            icon: goalIcon,
            name: goalName,
            age: goal.dataset.age,
            amount: goal.dataset.amount,
            goalType: goal.dataset.goalType,
            left: goal.style.left,
            top: goal.style.top
        });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showAutoSaveIndicator();
    console.log('✓ Data saved to localStorage');
}

// Show auto-save indicator
function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

// Export data as JSON file
function exportData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        alert('No data to export! Please add some data first.');
        return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelliwealth-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
}

// Import data from JSON file
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                alert('✅ Data imported successfully! Reloading page...');
                location.reload();
            } catch (error) {
                alert('❌ Error importing data. Please ensure the file is valid.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Clear all data
function clearAllData() {
    if (confirm('⚠️ Are you sure you want to clear all data? This cannot be undone!')) {
        localStorage.removeItem(STORAGE_KEY);
        alert('✅ All data cleared! Reloading page...');
        location.reload();
    }
}

// Auto-save on changes
let autoSaveTimeout;
function triggerAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveAllData();
    }, 1000); // Save 1 second after last change
}

// ===== GAMIFICATION SYSTEM =====
function calculateGamificationStats() {
    // Calculate based on user's financial health
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

    // Financial Score (0-1000)
    let score = 500; // Base score

    // Add points for positive savings
    if (savingsRate > 0) score += 50;
    if (savingsRate > 20) score += 100;
    if (savingsRate > 40) score += 150;
    if (savingsRate > 60) score += 100;

    // Calculate level (1-20)
    const level = Math.min(Math.floor(score / 50), 20);

    // Calculate XP for current level
    const xpForNextLevel = (level + 1) * 50;
    const xpInCurrentLevel = score % 50;
    const xpPercentage = (xpInCurrentLevel / 50) * 100;

    return {
        score: Math.round(score),
        level: level,
        xpPercentage: xpPercentage,
        savingsRate: savingsRate
    };
}

function updateGamificationUI(stats) {
    document.getElementById('financialScore').textContent = stats.score;
    document.getElementById('userLevel').textContent = `Level ${stats.level}`;
    document.getElementById('xpFill').style.width = `${stats.xpPercentage}%`;

    // Update achievement badges
    if (stats.savingsRate >= 40) {
        const badge = document.getElementById('badge-high-saver');
        if (badge && !badge.classList.contains('unlocked')) {
            badge.classList.add('unlocked');
            celebrateAchievement('High Saver Unlocked!');
        }
    }
}

function celebrateAchievement(message) {
    // Create confetti effect
    createConfetti();
    console.log('🎉 ' + message);
}

function createConfetti() {
    const colors = ['#d4af37', '#10b981', '#ef4444', '#3b82f6'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// ===== PAGE NAVIGATION =====
function goToPage(pageNum) {
    // Update page visibility
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page' + pageNum).classList.add('active');

    // Update navigation progress with TAILWIND classes
    document.querySelectorAll('.nav-step').forEach((step, index) => {
        const circle = step.querySelector('.nav-step-circle');
        const label = step.querySelector('.nav-step-label');
        const stepNum = index + 1;

        if (stepNum === pageNum) {
            // ACTIVE STEP
            step.classList.add('active');
            step.classList.remove('completed');

            // Circle: Blue background, White text, White Ring
            circle.classList.remove('bg-slate-200', 'text-slate-600', 'bg-green-500');
            circle.classList.add('bg-primary', 'text-white', 'ring-4');

            // Label: Dark text, Bold
            label.classList.remove('text-slate-500', 'text-green-600');
            label.classList.add('text-slate-900', 'dark:text-white', 'font-bold');

        } else if (stepNum < pageNum) {
            // COMPLETED STEP
            step.classList.add('completed');
            step.classList.remove('active');

            // Circle: Green background (or Primary), White text
            circle.classList.remove('bg-slate-200', 'text-slate-600', 'bg-primary', 'ring-4');
            circle.classList.add('bg-green-500', 'text-white');

            // Label: Green text
            label.classList.remove('text-slate-500', 'text-slate-900', 'dark:text-white');
            label.classList.add('text-green-600');

        } else {
            // FUTURE STEP
            step.classList.remove('active', 'completed');

            // Circle: Grey background, Grey text
            circle.classList.remove('bg-primary', 'bg-green-500', 'text-white', 'ring-4');
            circle.classList.add('bg-slate-200', 'text-slate-600');

            // Label: Grey text
            label.classList.remove('text-slate-900', 'dark:text-white', 'text-green-600', 'font-bold');
            label.classList.add('text-slate-500');
        }
    });

    window.scrollTo(0, 0);

    // Trigger particle effects on vault
    if (pageNum === 1) {
        createVaultParticles();
    }

    // Initialize timeline when entering Page 3
    if (pageNum === 3) {
        setTimeout(() => {
            initializePage3();
        }, 50); // Small delay to ensure elements are rendered
    }

    // Trigger FIRE calculation when entering Page 4
    if (pageNum === 4) {
        populateFIREInputs();
        initScenarioSliders();
        computeFIRE();
    }
}

// ===== PAGE 1: INCOME & EXPENSES - Drag Sliders =====
document.querySelectorAll('.amount-slider').forEach(slider => {
    let isDragging = false;

    slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSlider(e, slider);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSlider(e, slider);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    function updateSlider(e, slider) {
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const maxValue = parseInt(slider.dataset.max);
        const value = Math.round((percentage / 100) * maxValue);

        slider.dataset.value = value;
        const fill = slider.querySelector('.slider-fill');
        fill.style.width = percentage + '%';

        if (slider.dataset.type === 'percent') {
            fill.textContent = value + '%';
        } else {
            fill.textContent = '₹' + value.toLocaleString('en-IN');
        }

        calculateTotals();
        triggerAutoSave();
    }
});

function calculateTotalIncome() {
    const salary = parseInt(document.querySelector('[data-field="salary"]').dataset.value) * 12;
    const bonus = parseInt(document.querySelector('[data-field="bonus"]').dataset.value);
    const rental = parseInt(document.querySelector('[data-field="rental"]').dataset.value) * 12;
    const business = parseInt(document.querySelector('[data-field="business"]').dataset.value) * 12;
    const investment = parseInt(document.querySelector('[data-field="investment"]').dataset.value) * 12;
    const otherIncome = parseInt(document.querySelector('[data-field="otherIncome"]').dataset.value) * 12;

    return salary + bonus + rental + business + investment + otherIncome;
}

function calculateTotalExpenses() {
    const rent = parseInt(document.querySelector('[data-field="rent"]').dataset.value) * 12;
    const schoolFees = parseInt(document.querySelector('[data-field="schoolFees"]').dataset.value) * 12;
    const household = parseInt(document.querySelector('[data-field="household"]').dataset.value) * 12;
    const emis = parseInt(document.querySelector('[data-field="emis"]').dataset.value) * 12;
    const vacation = parseInt(document.querySelector('[data-field="vacation"]').dataset.value);
    const discretionary = parseInt(document.querySelector('[data-field="discretionary"]').dataset.value);
    const lifeInsurance = parseInt(document.querySelector('[data-field="lifeInsurance"]').dataset.value);
    const healthInsurance = parseInt(document.querySelector('[data-field="healthInsurance"]').dataset.value);
    const maintenance = parseInt(document.querySelector('[data-field="maintenance"]').dataset.value);

    return rent + schoolFees + household + emis + vacation + discretionary + lifeInsurance + healthInsurance + maintenance;
}

function calculateTotals() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();

    // Savings
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0;

    // Update displays
    document.getElementById('totalIncome').textContent = totalIncome.toLocaleString('en-IN');
    document.getElementById('totalExpenses').textContent = totalExpenses.toLocaleString('en-IN');
    document.getElementById('inflowDisplay').textContent = '₹' + totalIncome.toLocaleString('en-IN');
    document.getElementById('outflowDisplay').textContent = '₹' + totalExpenses.toLocaleString('en-IN');
    document.getElementById('netSavings').textContent = '₹' + netSavings.toLocaleString('en-IN');
    document.getElementById('savingsRateText').textContent = savingsRate.toFixed(1) + '%';

    // Update gamification
    const stats = calculateGamificationStats();
    updateGamificationUI(stats);

    // Animate vault on savings change
    if (netSavings > 0) {
        createVaultParticles();
    }
}

// Create floating particles from vault
function createVaultParticles() {
    const vault = document.getElementById('vault');
    if (!vault) return;

    const rect = vault.getBoundingClientRect();

    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = (rect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top + rect.height / 2) + 'px';
        particle.style.animationDelay = (i * 0.6) + 's';
        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 3000);
    }
}

// Initial calculation
calculateTotals();

// Save Functions
function savePage1() {
    saveAllData();
    alert('✅ Income & Expenses data saved!');
    createConfetti();
}

// ===== PAGE 2: ASSETS & LIABILITIES =====
const droppedItems = {
    liabilities: [],
    assets: []
};

// Default categories for new users (all start at ₹0)
const DEFAULT_ASSETS = [
    { name: 'Fixed Deposits', value: '0', icon: '💰', category: 'liquid' },
    { name: 'Saving Bank Balances', value: '0', icon: '💰', category: 'liquid' },
    { name: 'Stocks/Equity - Shares', value: '0', icon: '📈', category: 'invested' },
    { name: 'Mutual Funds', value: '0', icon: '📈', category: 'invested' },
    { name: 'Real Estate (Value)', value: '0', icon: '🏠', category: 'property' },
    { name: 'EPF Balance as on date', value: '0', icon: '💰', category: 'liquid' },
    { name: 'Any other Assets (>5Lac)', value: '0', icon: '🎨', category: 'other' }
];

const DEFAULT_LIABILITIES = [
    { name: 'Outstanding Home Loan', value: '0', icon: '🏡', category: 'home-loan' },
    { name: 'Vehicle Loan', value: '0', icon: '🚙', category: 'car-loan' },
    { name: 'Personal Loan', value: '0', icon: '👤', category: 'personal' },
    { name: 'Any Other Loan', value: '0', icon: '📋', category: 'other' }
];

function populateDefaults() {
    droppedItems.assets = DEFAULT_ASSETS.map(item => ({ ...item }));
    droppedItems.liabilities = DEFAULT_LIABILITIES.map(item => ({ ...item }));
    updateBalanceSheet();
}


// Add item with prompt
function addItemWithPrompt(element) {
    const type = element.dataset.type;
    const name = element.dataset.name;

    // Check if already added
    const list = type === 'liability' ? droppedItems.liabilities : droppedItems.assets;
    if (list.find(item => item.name === name)) {
        alert(`${name} is already added to the balance!`);
        return;
    }

    // Prompt for amount
    const amountStr = prompt(`Enter amount for ${name} (in Lakhs):`, '10');
    if (!amountStr || amountStr.trim() === '') {
        return;
    }

    const amountInLakhs = parseFloat(amountStr);
    if (isNaN(amountInLakhs) || amountInLakhs < 0) {
        alert('Please enter a valid positive number!');
        return;
    }

    // Convert to rupees
    const amountInRupees = amountInLakhs * 100000;

    // Add to balance
    const data = {
        type: type,
        name: name,
        value: amountInRupees.toString()
    };

    list.push(data);
    updateBalanceSheet();
    triggerAutoSave();

    // Visual feedback
    element.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
    setTimeout(() => {
        element.style.backgroundColor = '';
    }, 500);
}

function updateBalanceSheet() {
    // Update liabilities
    const liabilitiesList = document.getElementById('liabilitiesList');
    liabilitiesList.innerHTML = '';
    let totalLiabilities = 0;

    droppedItems.liabilities.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'balance-item liability-item';
        div.innerHTML = `
            <span>${item.name}</span>
            <span style="display: flex; align-items: center; gap: 8px;">
                ₹<input type="number" class="balance-editable-value" value="${(parseInt(item.value) / 100000).toFixed(0)}"
                       min="0" step="1" data-index="${index}" data-type="liability"
                       onchange="updateBalanceItemValue(this)" onclick="event.stopPropagation()"> L
                <button class="remove-btn" onclick="removeFromBalance('liability', ${index})" title="Remove">❌</button>
            </span>
        `;
        liabilitiesList.appendChild(div);
        totalLiabilities += parseInt(item.value);
    });

    // Update assets
    const assetsList = document.getElementById('assetsList');
    assetsList.innerHTML = '';
    let totalAssets = 0;

    droppedItems.assets.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'balance-item asset-item';
        const isInCrores = parseInt(item.value) >= 10000000;
        const displayValue = isInCrores ? (parseInt(item.value) / 10000000).toFixed(1) : (parseInt(item.value) / 100000).toFixed(0);
        const unit = isInCrores ? 'Cr' : 'L';
        div.innerHTML = `
            <span>${item.name}</span>
            <span style="display: flex; align-items: center; gap: 8px;">
                ₹<input type="number" class="balance-editable-value" value="${displayValue}"
                       min="0" step="${isInCrores ? '0.1' : '1'}" data-index="${index}" data-type="asset"
                       data-unit="${unit}" onchange="updateBalanceItemValue(this)" onclick="event.stopPropagation()"> ${unit}
                <button class="remove-btn" onclick="removeFromBalance('asset', ${index})" title="Remove">❌</button>
            </span>
        `;
        assetsList.appendChild(div);
        totalAssets += parseInt(item.value);
    });

    // Update totals
    document.getElementById('totalLiabilities').textContent = (totalLiabilities / 100000).toFixed(0) + ' Lacs';
    document.getElementById('totalAssets').textContent = totalAssets >= 10000000 ?
        (totalAssets / 10000000).toFixed(2) + ' Cr' :
        (totalAssets / 100000).toFixed(0) + ' Lacs';

    const netWorth = totalAssets - totalLiabilities;
    document.getElementById('netWorth').textContent = netWorth >= 10000000 ?
        (netWorth / 10000000).toFixed(2) + ' Cr' :
        (netWorth / 100000).toFixed(0) + ' Lacs';

    // Tilt balance scale
    const balance = document.getElementById('balanceBeam');
    const tiltDegree = Math.max(-15, Math.min(15, (totalAssets - totalLiabilities) / 1000000));
    balance.style.transform = `translate(-50%, -50%) rotate(${tiltDegree}deg)`;
}

function updateBalanceItemValue(input) {
    const index = parseInt(input.dataset.index);
    const type = input.dataset.type;
    const value = parseFloat(input.value);
    const unit = input.dataset.unit || 'L';

    // Convert to rupees
    let rupees;
    if (unit === 'Cr') {
        rupees = value * 10000000;
    } else {
        rupees = value * 100000;
    }

    // Update the stored value
    if (type === 'liability') {
        droppedItems.liabilities[index].value = rupees.toString();
    } else {
        droppedItems.assets[index].value = rupees.toString();
    }

    // Refresh display
    updateBalanceSheet();
    triggerAutoSave();
}

function removeFromBalance(type, index) {
    if (type === 'liability') {
        droppedItems.liabilities.splice(index, 1);
    } else {
        droppedItems.assets.splice(index, 1);
    }
    updateBalanceSheet();
    triggerAutoSave();
}

function savePage2() {
    saveAllData();
    alert('✅ Assets & Liabilities saved!');
}

// ===== PREMIUM BALANCE SHEET MODAL UI =====
let currentModalType = null;
let currentEditingIndex = null;

// Category configurations
const ASSET_CATEGORIES = [
    { icon: '💰', label: 'Cash & Bank', value: 'liquid' },
    { icon: '📈', label: 'Investments', value: 'invested' },
    { icon: '🏠', label: 'Property', value: 'property' },
    { icon: '🚗', label: 'Vehicles', value: 'vehicle' },
    { icon: '💎', label: 'Jewelry', value: 'jewelry' },
    { icon: '🎨', label: 'Other Assets', value: 'other' }
];

const LIABILITY_CATEGORIES = [
    { icon: '🏡', label: 'Home Loan', value: 'home-loan' },
    { icon: '🚙', label: 'Car Loan', value: 'car-loan' },
    { icon: '💳', label: 'Credit Card', value: 'credit' },
    { icon: '👤', label: 'Personal Loan', value: 'personal' },
    { icon: '🎓', label: 'Education Loan', value: 'education' },
    { icon: '📋', label: 'Other Debt', value: 'other' }
];


function selectUnit(unit) {
    document.querySelectorAll('.unit-btn').forEach(btn => {
        if (btn.dataset.unit === unit) {
            btn.classList.add('active', 'border-primary', 'bg-primary', 'text-white', 'shadow-sm');
            btn.classList.remove('border-slate-200', 'dark:border-gray-700', 'bg-slate-50', 'dark:bg-gray-900', 'text-slate-700', 'dark:text-slate-300');
        } else {
            btn.classList.remove('active', 'border-primary', 'bg-primary', 'text-white', 'shadow-sm');
            btn.classList.add('border-slate-200', 'dark:border-gray-700', 'bg-slate-50', 'dark:bg-gray-900', 'text-slate-700', 'dark:text-slate-300');
        }
    });
}

function selectCategory(category) {
    document.querySelectorAll('.category-option').forEach(opt => {
        if (opt.dataset.category === category) {
            opt.classList.add('border-primary', 'bg-primary/10');
            opt.classList.remove('border-slate-200', 'dark:border-gray-700', 'bg-slate-50', 'dark:bg-gray-900');
        } else {
            opt.classList.remove('border-primary', 'bg-primary/10');
            opt.classList.add('border-slate-200', 'dark:border-gray-700', 'bg-slate-50', 'dark:bg-gray-900');
        }
    });
}


// ========================================
// INLINE EDITING FUNCTIONS
// ========================================

// State management for inline editing
let inlineEditingType = null;
let inlineEditingIndex = null;
let selectedInlineCategory = null;
let selectedInlineUnit = 'L';
let selectedInlineIcon = null;

// Helper function to render inline form HTML
function renderInlineFormHTML(type, itemData = null) {
    const isAsset = type === 'asset';
    const categories = isAsset ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
    const colorClass = isAsset ? 'emerald' : 'red';

    // Determine default or existing values
    let defaultIcon = categories[0].icon;
    let defaultCategory = categories[0].value;
    let defaultName = '';
    let displayValue = '';
    let currentUnit = 'L';

    if (itemData) {
        defaultName = itemData.name || '';
        defaultIcon = itemData.icon || categories[0].icon;
        defaultCategory = itemData.category || categories[0].value;

        // Calculate display value and unit from rupees
        const value = parseInt(itemData.value);
        if (value >= 10000000) {
            displayValue = (value / 10000000).toFixed(2);
            currentUnit = 'Cr';
        } else if (value >= 100000) {
            displayValue = (value / 100000).toFixed(0);
            currentUnit = 'L';
        } else {
            displayValue = (value / 1000).toFixed(0);
            currentUnit = 'K';
        }
    }

    // Initialize selected values
    selectedInlineCategory = defaultCategory;
    selectedInlineUnit = currentUnit;
    selectedInlineIcon = defaultIcon;

    const categoryObj = categories.find(c => c.value === defaultCategory);
    const categoryLabel = categoryObj ? categoryObj.label : 'Select Category';

    // Determine concrete color classes based on type
    const borderColor = isAsset ? 'border-emerald-200 dark:border-emerald-900/30' : 'border-red-200 dark:border-red-900/30';
    const iconBg = isAsset ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30';
    const iconHoverBg = isAsset ? 'hover:bg-emerald-200 dark:hover:bg-emerald-900/50' : 'hover:bg-red-200 dark:hover:bg-red-900/50';
    const iconBorder = isAsset ? 'border-emerald-300 dark:border-emerald-700' : 'border-red-300 dark:border-red-700';
    const focusBorder = isAsset ? 'focus:border-emerald-400' : 'focus:border-red-400';
    const focusRing = isAsset ? 'focus:ring-emerald-400/20' : 'focus:ring-red-400/20';
    const unitActiveBorder = isAsset ? 'border-emerald-500' : 'border-red-500';
    const unitActiveBg = isAsset ? 'bg-emerald-500' : 'bg-red-500';
    const unitHoverBorder = isAsset ? 'hover:border-emerald-400' : 'hover:border-red-400';
    const dropdownOptionHover = isAsset ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10' : 'hover:bg-red-50 dark:hover:bg-red-900/10';
    const dropdownOptionActive = isAsset ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-red-50 dark:bg-red-900/10';
    const saveBtnColor = isAsset ? '#059669' : '#dc2626'; // emerald-600 / red-600
    const saveBtnHoverColor = isAsset ? '#047857' : '#b91c1c'; // emerald-700 / red-700

    return `
        <div class="bs-inline-form group bg-white dark:bg-[#151c2b] rounded-xl p-4 border-2 ${borderColor} shadow-lg"
             data-type="${type}" ${itemData ? `data-editing-index="${itemData.index}"` : ''}>
            <div class="flex flex-col gap-3">
                <!-- Row 1: Icon Dropdown, Name, Amount, Unit -->
                <div class="flex items-center gap-2 flex-wrap">
                    <!-- Category Icon Dropdown with indicator -->
                    <div class="relative flex-shrink-0">
                        <button type="button" class="bs-category-trigger relative w-12 h-10 rounded-lg ${iconBg} border-2 ${iconBorder}
                                    flex items-center justify-center text-xl cursor-pointer ${iconHoverBg}
                                    transition-all group-hover:scale-105"
                                onclick="toggleCategoryDropdown(event, '${type}')"
                                title="Click to change category">
                            <span class="inline-category-icon-display">${defaultIcon}</span>
                            <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-600 dark:bg-slate-400 text-white dark:text-slate-900
                                       rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">▼</span>
                        </button>
                        <div class="bs-category-dropdown hidden absolute top-full left-0 mt-2 bg-white dark:bg-[#151c2b] rounded-xl
                                    shadow-xl border-2 border-slate-200 dark:border-gray-700 p-2 z-50 min-w-[200px]">
                            ${categories.map(cat => `
                                <button type="button" class="category-dropdown-option w-full p-2 rounded-lg flex items-center gap-2
                                        ${dropdownOptionHover} transition-colors
                                        ${cat.value === defaultCategory ? dropdownOptionActive : ''}"
                                        data-category="${cat.value}" data-icon="${cat.icon}"
                                        onclick="selectInlineCategory(event, '${type}', '${cat.value}', '${cat.icon}')">
                                    <span class="text-xl">${cat.icon}</span>
                                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">${cat.label}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Name Input -->
                    <input type="text" class="inline-name-input px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-gray-700
                                bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white font-semibold
                                ${focusBorder} focus:ring-2 ${focusRing} focus:bg-white dark:focus:bg-gray-800
                                transition-all outline-none" placeholder="Enter name..." value="${defaultName}"
                                style="flex: 1 1 150px; min-width: 150px;" autofocus>

                    <!-- Amount Input with Currency Symbol -->
                    <div class="relative" style="flex: 0 0 auto; width: 120px;">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-bold">₹</span>
                        <input type="number" class="inline-amount-input w-full pl-8 pr-3 py-2 rounded-lg border-2 border-slate-200 dark:border-gray-700
                                    bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white font-semibold
                                    ${focusBorder} focus:ring-2 ${focusRing} focus:bg-white dark:focus:bg-gray-800
                                    transition-all outline-none" placeholder="0" min="0" step="0.01" value="${displayValue}">
                    </div>

                    <!-- Unit Selector -->
                    <div class="inline-unit-selector flex gap-1 flex-shrink-0 flex-wrap">
                        <button type="button" class="unit-btn-inline px-2 py-2 rounded-lg border-2 font-bold transition-all text-xs
                                ${currentUnit === '₹' ? 'text-white' : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300'}"
                                ${currentUnit === '₹' ? `style="background-color: ${saveBtnColor}; border-color: ${saveBtnColor};"` : ''}
                                data-unit="₹" onclick="selectInlineUnit(event, '${type}', '₹')" title="Absolute value in Rupees">₹</button>
                        <button type="button" class="unit-btn-inline px-2 py-2 rounded-lg border-2 font-bold transition-all text-xs
                                ${currentUnit === 'K' ? 'text-white' : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300'}"
                                ${currentUnit === 'K' ? `style="background-color: ${saveBtnColor}; border-color: ${saveBtnColor};"` : ''}
                                data-unit="K" onclick="selectInlineUnit(event, '${type}', 'K')" title="Thousands">K</button>
                        <button type="button" class="unit-btn-inline px-2 py-2 rounded-lg border-2 font-bold transition-all text-xs
                                ${currentUnit === 'L' ? 'text-white' : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300'}"
                                ${currentUnit === 'L' ? `style="background-color: ${saveBtnColor}; border-color: ${saveBtnColor};"` : ''}
                                data-unit="L" onclick="selectInlineUnit(event, '${type}', 'L')" title="Lakhs">L</button>
                        <button type="button" class="unit-btn-inline px-2 py-2 rounded-lg border-2 font-bold transition-all text-xs
                                ${currentUnit === 'Cr' ? 'text-white' : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300'}"
                                ${currentUnit === 'Cr' ? `style="background-color: ${saveBtnColor}; border-color: ${saveBtnColor};"` : ''}
                                data-unit="Cr" onclick="selectInlineUnit(event, '${type}', 'Cr')" title="Crores">Cr</button>
                    </div>
                </div>

                <!-- Row 2: Category Label and Action Buttons -->
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="text-xs text-slate-500 dark:text-slate-400 inline-category-label">
                        Category: <span class="font-semibold">${categoryLabel}</span>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button type="button" onclick="cancelInlineEdit('${type}')"
                                class="px-4 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300
                                       font-semibold hover:bg-slate-200 dark:hover:bg-gray-700 transition-all">
                            Cancel
                        </button>
                        <button type="button" onclick="${itemData ? `updateInlineItem('${type}', ${itemData.index})` : `saveInlineItem('${type}')`}"
                                class="inline-save-btn px-4 py-2 rounded-lg text-white font-bold
                                       shadow-lg transition-all flex items-center gap-2"
                                style="background-color: ${saveBtnColor};"
                                onmouseover="this.style.backgroundColor='${saveBtnHoverColor}'"
                                onmouseout="this.style.backgroundColor='${saveBtnColor}'">
                            <span>${itemData ? '✓ Update' : '✓ Save'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show inline form for adding new item
function showInlineForm(type) {
    // Hide any existing inline form first
    hideInlineForm('asset');
    hideInlineForm('liability');

    const listId = type === 'asset' ? 'assetsList' : 'liabilitiesList';
    const list = document.getElementById(listId);
    const addButton = document.querySelector(`button[onclick="showInlineForm('${type}')"]`);

    if (!list) return;

    // Hide the add button
    if (addButton) addButton.style.display = 'none';

    // Insert inline form at the end of the list
    const formHTML = renderInlineFormHTML(type);
    list.insertAdjacentHTML('beforeend', formHTML);

    // Set editing state
    inlineEditingType = type;
    inlineEditingIndex = null;

    // Focus name input after a brief delay for rendering
    setTimeout(() => {
        const nameInput = list.querySelector('.inline-name-input');
        if (nameInput) nameInput.focus();
    }, 50);
}

// Hide inline form
function hideInlineForm(type) {
    const listId = type === 'asset' ? 'assetsList' : 'liabilitiesList';
    const list = document.getElementById(listId);
    const addButton = document.querySelector(`button[onclick="showInlineForm('${type}')"]`);

    if (!list) return;

    // Remove inline form
    const inlineForm = list.querySelector('.bs-inline-form');
    if (inlineForm) {
        inlineForm.remove();
    }

    // Show the add button again
    if (addButton) addButton.style.display = '';

    // Clear editing state
    if (inlineEditingType === type) {
        inlineEditingType = null;
        inlineEditingIndex = null;
        selectedInlineCategory = null;
        selectedInlineUnit = 'L';
        selectedInlineIcon = null;
    }

    // If list is empty, show empty state
    const items = type === 'asset' ? droppedItems.assets : droppedItems.liabilities;
    if (items.length === 0 && !list.querySelector('.bs-inline-form')) {
        updateBalanceSheetPremium();
    }
}

// Toggle category dropdown
function toggleCategoryDropdown(event, type) {
    event.stopPropagation();
    const button = event.currentTarget;
    const dropdown = button.nextElementSibling;

    if (!dropdown) return;

    // Close all other dropdowns
    document.querySelectorAll('.bs-category-dropdown').forEach(dd => {
        if (dd !== dropdown) dd.classList.add('hidden');
    });

    dropdown.classList.toggle('hidden');
}

// Select inline category
function selectInlineCategory(event, type, category, icon) {
    event.stopPropagation();

    selectedInlineCategory = category;
    selectedInlineIcon = icon;

    const listId = type === 'asset' ? 'assetsList' : 'liabilitiesList';
    const list = document.getElementById(listId);
    const inlineForm = list?.querySelector('.bs-inline-form');

    if (!inlineForm) return;

    // Update icon display
    const iconDisplay = inlineForm.querySelector('.inline-category-icon-display');
    if (iconDisplay) iconDisplay.textContent = icon;

    // Update category label
    const categories = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
    const categoryObj = categories.find(c => c.value === category);
    const categoryLabel = inlineForm.querySelector('.inline-category-label span');
    if (categoryLabel && categoryObj) {
        categoryLabel.textContent = categoryObj.label;
    }

    // Highlight selected option
    const options = inlineForm.querySelectorAll('.category-dropdown-option');
    options.forEach(opt => {
        if (opt.dataset.category === category) {
            opt.classList.add('bg-emerald-50', 'dark:bg-emerald-900/10');
        } else {
            opt.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/10', 'bg-red-50', 'dark:bg-red-900/10');
        }
    });

    // Close dropdown
    const dropdown = inlineForm.querySelector('.bs-category-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
}

// Select inline unit
function selectInlineUnit(event, type, unit) {
    event.stopPropagation();
    selectedInlineUnit = unit;

    const listId = type === 'asset' ? 'assetsList' : 'liabilitiesList';
    const list = document.getElementById(listId);
    const inlineForm = list?.querySelector('.bs-inline-form');

    if (!inlineForm) return;

    // Update button styles with inline colors
    const buttons = inlineForm.querySelectorAll('.unit-btn-inline');
    const activeColor = type === 'asset' ? '#059669' : '#dc2626'; // emerald-600 / red-600
    const activeBorderColor = type === 'asset' ? '#059669' : '#dc2626';

    buttons.forEach(btn => {
        if (btn.dataset.unit === unit) {
            // Active button - colored like save button
            btn.className = 'unit-btn-inline px-2 py-2 rounded-lg border-2 font-bold transition-all text-xs text-white';
            btn.style.backgroundColor = activeColor;
            btn.style.borderColor = activeBorderColor;
        } else {
            // Inactive button - default styling
            btn.className = 'unit-btn-inline px-2 py-2 rounded-lg border-2 font-bold transition-all text-xs border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300';
            btn.style.backgroundColor = '';
            btn.style.borderColor = '';
        }
    });
}

// Save new inline item
function saveInlineItem(type) {
    const listId = type === 'asset' ? 'assetsList' : 'liabilitiesList';
    const list = document.getElementById(listId);
    const inlineForm = list?.querySelector('.bs-inline-form');

    if (!inlineForm) return;

    const nameInput = inlineForm.querySelector('.inline-name-input');
    const amountInput = inlineForm.querySelector('.inline-amount-input');

    const name = nameInput?.value.trim();
    const amountStr = amountInput?.value.trim();

    // Validation
    if (!name) {
        alert('Please enter a name');
        nameInput?.focus();
        return;
    }

    if (!amountStr || isNaN(parseFloat(amountStr))) {
        alert('Please enter a valid amount');
        amountInput?.focus();
        return;
    }

    if (!selectedInlineCategory) {
        alert('Please select a category');
        return;
    }

    const amount = parseFloat(amountStr);

    // Convert to rupees
    let rupees;
    switch (selectedInlineUnit) {
        case '₹': rupees = amount; break; // Absolute value in rupees
        case 'K': rupees = amount * 1000; break;
        case 'L': rupees = amount * 100000; break;
        case 'Cr': rupees = amount * 10000000; break;
        default: rupees = amount; // Default to absolute value
    }

    const itemData = {
        type: type,
        name: name,
        value: rupees.toString(),
        category: selectedInlineCategory,
        icon: selectedInlineIcon
    };

    // Add to appropriate array
    if (type === 'asset') {
        droppedItems.assets.push(itemData);
    } else {
        droppedItems.liabilities.push(itemData);
    }

    // Update display and save
    hideInlineForm(type);
    updateBalanceSheetPremium();
    triggerAutoSave();
}

// Cancel inline edit
function cancelInlineEdit(type) {
    hideInlineForm(type);
}

// Edit existing item inline
function editItemInline(type, index) {
    // Hide any existing inline forms
    hideInlineForm('asset');
    hideInlineForm('liability');

    const list = type === 'asset' ? droppedItems.assets : droppedItems.liabilities;
    const item = list[index];

    if (!item) return;

    const listId = type === 'asset' ? 'assetsList' : 'liabilitiesList';
    const listElement = document.getElementById(listId);

    if (!listElement) return;

    // Find the item card and replace it with inline form
    const itemCards = listElement.querySelectorAll('.group');
    const itemCard = itemCards[index];

    if (!itemCard) return;

    // Set editing state
    inlineEditingType = type;
    inlineEditingIndex = index;

    // Generate form HTML with item data
    const formHTML = renderInlineFormHTML(type, { ...item, index });

    // Replace item card with form
    itemCard.outerHTML = formHTML;

    // Focus name input
    setTimeout(() => {
        const nameInput = listElement.querySelector('.inline-name-input');
        if (nameInput) nameInput.focus();
    }, 50);
}

// Update existing item
function updateInlineItem(type, index) {
    const listId = type === 'asset' ? 'assetsList' : 'liabilitiesList';
    const list = document.getElementById(listId);
    const inlineForm = list?.querySelector('.bs-inline-form');

    if (!inlineForm) return;

    const nameInput = inlineForm.querySelector('.inline-name-input');
    const amountInput = inlineForm.querySelector('.inline-amount-input');

    const name = nameInput?.value.trim();
    const amountStr = amountInput?.value.trim();

    // Validation
    if (!name) {
        alert('Please enter a name');
        nameInput?.focus();
        return;
    }

    if (!amountStr || isNaN(parseFloat(amountStr))) {
        alert('Please enter a valid amount');
        amountInput?.focus();
        return;
    }

    if (!selectedInlineCategory) {
        alert('Please select a category');
        return;
    }

    const amount = parseFloat(amountStr);

    // Convert to rupees
    let rupees;
    switch (selectedInlineUnit) {
        case '₹': rupees = amount; break; // Absolute value in rupees
        case 'K': rupees = amount * 1000; break;
        case 'L': rupees = amount * 100000; break;
        case 'Cr': rupees = amount * 10000000; break;
        default: rupees = amount; // Default to absolute value
    }

    const itemData = {
        type: type,
        name: name,
        value: rupees.toString(),
        category: selectedInlineCategory,
        icon: selectedInlineIcon
    };

    // Update item in array
    if (type === 'asset') {
        droppedItems.assets[index] = itemData;
    } else {
        droppedItems.liabilities[index] = itemData;
    }

    // Clear editing state and update display
    inlineEditingType = null;
    inlineEditingIndex = null;
    updateBalanceSheetPremium();
    triggerAutoSave();
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.bs-category-trigger') && !e.target.closest('.bs-category-dropdown')) {
        document.querySelectorAll('.bs-category-dropdown').forEach(dd => {
            dd.classList.add('hidden');
        });
    }
});

// Keyboard navigation for inline forms
document.addEventListener('keydown', (e) => {
    const inlineForm = document.querySelector('.bs-inline-form');
    if (!inlineForm) return;

    const type = inlineForm.dataset.type;
    const editingIndex = inlineForm.dataset.editingIndex;

    // Escape key: Cancel edit
    if (e.key === 'Escape') {
        e.preventDefault();
        cancelInlineEdit(type);
        return;
    }

    // Enter key handling
    if (e.key === 'Enter') {
        const nameInput = inlineForm.querySelector('.inline-name-input');
        const amountInput = inlineForm.querySelector('.inline-amount-input');

        // If focus is on name input, move to amount input
        if (document.activeElement === nameInput) {
            e.preventDefault();
            amountInput?.focus();
            return;
        }

        // If focus is on amount input, save item
        if (document.activeElement === amountInput) {
            e.preventDefault();
            if (editingIndex !== undefined && editingIndex !== '') {
                updateInlineItem(type, parseInt(editingIndex));
            } else {
                saveInlineItem(type);
            }
            return;
        }
    }
});

// Helper: compute display value and current unit from rupees
function getDisplayAndUnit(rupees) {
    const value = parseInt(rupees) || 0;
    if (value >= 10000000) {
        return { displayValue: (value / 10000000).toFixed(2), unit: 'Cr' };
    } else if (value >= 100000) {
        return { displayValue: (value / 100000).toFixed(0), unit: 'L' };
    } else {
        return { displayValue: (value / 1000).toFixed(0), unit: 'K' };
    }
}

// Handle in-place value/unit change on a balance sheet card
function updateInPlaceValue(type, index, inputEl) {
    const card = inputEl.closest('.bs-card');
    const unitSelect = card.querySelector('.bs-unit-select');
    const numValue = parseFloat(inputEl.value) || 0;
    const unit = unitSelect.value;

    let rupees;
    if (unit === 'Cr') rupees = numValue * 10000000;
    else if (unit === 'L') rupees = numValue * 100000;
    else if (unit === 'K') rupees = numValue * 1000;
    else rupees = numValue;

    const list = type === 'asset' ? droppedItems.assets : droppedItems.liabilities;
    list[index].value = Math.round(rupees).toString();

    // Update totals without full re-render (avoids losing focus)
    let totalAssets = 0;
    droppedItems.assets.forEach(item => { totalAssets += parseInt(item.value) || 0; });
    let totalLiabilities = 0;
    droppedItems.liabilities.forEach(item => { totalLiabilities += parseInt(item.value) || 0; });
    const netWorth = totalAssets - totalLiabilities;

    const fmt = (amount) => {
        const abs = Math.abs(amount);
        if (abs >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (abs >= 100000) return `₹${(amount / 100000).toFixed(0)} L`;
        if (abs >= 1000) return `₹${(amount / 1000).toFixed(0)} K`;
        return `₹${amount.toFixed(0)}`;
    };

    document.getElementById('totalAssets').textContent = fmt(totalAssets);
    document.getElementById('totalLiabilities').textContent = fmt(totalLiabilities);
    document.getElementById('netWorth').textContent = fmt(netWorth);

    triggerAutoSave();
}

// Enhanced balance sheet renderer
function updateBalanceSheetPremium() {
    // Render Assets
    const assetsList = document.getElementById('assetsList');
    if (droppedItems.assets.length === 0) {
        assetsList.innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <div class="text-5xl mb-3 opacity-20">💰</div>
                <div class="text-sm font-medium">No assets added yet</div>
                <div class="text-xs mt-1 opacity-75">Start by adding your savings or investments</div>
            </div>
        `;
    } else {
        assetsList.innerHTML = droppedItems.assets.map((item, index) => {
            const { displayValue, unit } = getDisplayAndUnit(item.value);

            return `
                <div class="bs-card group bg-slate-50 dark:bg-gray-900 rounded-xl p-4 border-2 border-slate-100 dark:border-gray-800
                            hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:shadow-md
                            transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xl flex-shrink-0">
                            ${item.icon || '💰'}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-slate-900 dark:text-white truncate">${item.name}</div>
                            ${item.category ? `<div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                ${ASSET_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                            </div>` : ''}
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <span class="text-sm font-bold text-slate-500">₹</span>
                            <input type="number" value="${displayValue}" min="0" step="0.01"
                                   class="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-gray-700
                                          bg-white dark:bg-gray-800 text-right font-bold text-emerald-600 dark:text-emerald-400
                                          focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all text-sm"
                                   oninput="updateInPlaceValue('asset', ${index}, this)"
                                   onclick="event.stopPropagation(); this.select()">
                            <select class="bs-unit-select px-1.5 py-1 rounded-lg border border-slate-200 dark:border-gray-700
                                          bg-white dark:bg-gray-800 font-bold text-emerald-600 dark:text-emerald-400
                                          focus:border-emerald-400 focus:outline-none cursor-pointer text-sm"
                                    onchange="updateInPlaceValue('asset', ${index}, this.closest('.bs-card').querySelector('input[type=number]'))"
                                    onclick="event.stopPropagation()">
                                <option value="K" ${unit === 'K' ? 'selected' : ''}>K</option>
                                <option value="L" ${unit === 'L' ? 'selected' : ''}>L</option>
                                <option value="Cr" ${unit === 'Cr' ? 'selected' : ''}>Cr</option>
                            </select>
                            <button onclick="event.stopPropagation(); removeBalanceItem('asset', ${index})"
                                class="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400
                                       hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center transition-all"
                                aria-label="Delete asset">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render Liabilities
    const liabilitiesList = document.getElementById('liabilitiesList');
    if (droppedItems.liabilities.length === 0) {
        liabilitiesList.innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <div class="text-5xl mb-3 opacity-20">💳</div>
                <div class="text-sm font-medium">No liabilities added yet</div>
                <div class="text-xs mt-1 opacity-75">Track loans, credit cards, and debts</div>
            </div>
        `;
    } else {
        liabilitiesList.innerHTML = droppedItems.liabilities.map((item, index) => {
            const { displayValue, unit } = getDisplayAndUnit(item.value);

            return `
                <div class="bs-card group bg-slate-50 dark:bg-gray-900 rounded-xl p-4 border-2 border-slate-100 dark:border-gray-800
                            hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 hover:shadow-md
                            transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xl flex-shrink-0">
                            ${item.icon || '💳'}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-slate-900 dark:text-white truncate">${item.name}</div>
                            ${item.category ? `<div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                ${LIABILITY_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                            </div>` : ''}
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <span class="text-sm font-bold text-slate-500">₹</span>
                            <input type="number" value="${displayValue}" min="0" step="0.01"
                                   class="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-gray-700
                                          bg-white dark:bg-gray-800 text-right font-bold text-red-600 dark:text-red-400
                                          focus:border-red-400 focus:ring-2 focus:ring-red-400/20 focus:outline-none transition-all text-sm"
                                   oninput="updateInPlaceValue('liability', ${index}, this)"
                                   onclick="event.stopPropagation(); this.select()">
                            <select class="bs-unit-select px-1.5 py-1 rounded-lg border border-slate-200 dark:border-gray-700
                                          bg-white dark:bg-gray-800 font-bold text-red-600 dark:text-red-400
                                          focus:border-red-400 focus:outline-none cursor-pointer text-sm"
                                    onchange="updateInPlaceValue('liability', ${index}, this.closest('.bs-card').querySelector('input[type=number]'))"
                                    onclick="event.stopPropagation()">
                                <option value="K" ${unit === 'K' ? 'selected' : ''}>K</option>
                                <option value="L" ${unit === 'L' ? 'selected' : ''}>L</option>
                                <option value="Cr" ${unit === 'Cr' ? 'selected' : ''}>Cr</option>
                            </select>
                            <button onclick="event.stopPropagation(); removeBalanceItem('liability', ${index})"
                                class="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400
                                       hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center transition-all"
                                aria-label="Delete liability">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update totals
    let totalAssets = 0;
    droppedItems.assets.forEach(item => {
        totalAssets += parseInt(item.value) || 0;
    });

    let totalLiabilities = 0;
    droppedItems.liabilities.forEach(item => {
        totalLiabilities += parseInt(item.value) || 0;
    });

    const netWorth = totalAssets - totalLiabilities;

    // Smart currency formatting function
    const formatCurrency = (amount) => {
        const absAmount = Math.abs(amount);
        if (absAmount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (absAmount >= 100000) {
            return `₹${(amount / 100000).toFixed(0)} L`;
        } else if (absAmount >= 1000) {
            return `₹${(amount / 1000).toFixed(0)} K`;
        } else {
            return `₹${amount.toFixed(0)}`;
        }
    };

    document.getElementById('totalAssets').textContent = formatCurrency(totalAssets);
    document.getElementById('totalLiabilities').textContent = formatCurrency(totalLiabilities);
    document.getElementById('netWorth').textContent = formatCurrency(netWorth);
}

function removeBalanceItem(type, index) {
    if (confirm('Are you sure you want to delete this item?')) {
        if (type === 'asset') {
            droppedItems.assets.splice(index, 1);
        } else {
            droppedItems.liabilities.splice(index, 1);
        }
        updateBalanceSheetPremium();
        triggerAutoSave();
    }
}

// Override old updateBalanceSheet with premium version
updateBalanceSheet = updateBalanceSheetPremium;


// ===== PAGE 3: TIMELINE GOALS =====
let draggedGoal = null;
let isDraggingExisting = false;
let retirementAdded = false;
let selectedGoal = null;
let draftGoal = null;
let draggedGoalData = null;

const timelineContainer = document.getElementById('timelineContainer');
const timelineFrame = document.getElementById('timelineFrame');
const goalNameInput = document.getElementById('goalNameInput');
const goalAgeInput = document.getElementById('goalAgeInput');
const goalBudgetInput = document.getElementById('goalBudgetInput');
const goalIconInput = document.getElementById('goalIconInput');
const goalSaveBtn = document.getElementById('goalSaveBtn');
const goalCancelBtn = document.getElementById('goalCancelBtn');
const goalDeleteBtn = document.getElementById('goalDeleteBtn');
const goalEditorTitle = document.getElementById('goalEditorTitle');
const goalEditorHint = document.getElementById('goalEditorHint');

// Calculate X position on timeline based on age
function getTimelineFrameMetrics() {
    if (!timelineContainer || !timelineFrame) {
        return {
            frameLeft: 0,
            frameTop: 0,
            frameWidth: 1000,
            frameHeight: 300
        };
    }

    const containerRect = timelineContainer.getBoundingClientRect();
    const frameRect = timelineFrame.getBoundingClientRect();
    return {
        frameLeft: frameRect.left - containerRect.left,
        frameTop: frameRect.top - containerRect.top,
        frameWidth: frameRect.width,
        frameHeight: frameRect.height
    };
}

function ageToX(age) {
    const currentAge = parseInt(document.getElementById('currentAge').textContent);
    const lifeExpectancy = 100;
    const { frameLeft, frameWidth } = getTimelineFrameMetrics();
    const startX = 40;

    const ageRange = lifeExpectancy - currentAge;
    const ageDiff = age - currentAge;
    const percentage = Math.max(0, Math.min(1, ageDiff / ageRange));

    return frameLeft + startX + (percentage * (frameWidth - (startX * 2)));
}

// Calculate age based on X position on timeline
function xToAge(x) {
    const currentAge = parseInt(document.getElementById('currentAge').textContent);
    const lifeExpectancy = 100;
    const { frameLeft, frameWidth } = getTimelineFrameMetrics();
    const startX = 40;
    const ageRange = lifeExpectancy - currentAge;
    const percentage = Math.max(
        0,
        Math.min(1, (x - frameLeft - startX) / (frameWidth - (startX * 2)))
    );

    return Math.round(currentAge + (percentage * ageRange));
}

// Calculate Y position on Bezier curve for given X
function getYOnCurve(x) {
    const { frameLeft, frameTop, frameWidth, frameHeight } = getTimelineFrameMetrics();

    const startX = 40;
    const endX = frameWidth - 40;
    const midX = frameWidth / 2;

    const startY = frameHeight * 0.45;
    const midY = frameHeight * 0.3;
    const endY = frameHeight * 0.45;

    const localX = x - frameLeft;
    const t = (localX - startX) / (endX - startX);
    if (t < 0 || t > 1) return frameTop + startY;

    const y = Math.pow(1 - t, 2) * startY +
        2 * (1 - t) * t * midY +
        Math.pow(t, 2) * endY;

    return frameTop + y;
}

// Generate responsive SVG path
function generateTimelinePath() {
    const svg = document.querySelector('.timeline-curve');
    if (!svg) return;

    const width = svg.clientWidth || 1000;
    const path = document.getElementById('timelinePath');
    if (!path) return;

    const startX = 40;
    const endX = width - 40;
    const midX = width / 2;

    const startY = (svg.clientHeight || 300) * 0.45;
    const midY = (svg.clientHeight || 300) * 0.3;
    const endY = (svg.clientHeight || 300) * 0.45;

    const pathData = `M ${startX} ${startY} Q ${midX} ${midY}, ${endX} ${endY}`;
    path.setAttribute('d', pathData);
}

// Position characters on curve
function positionCharacters() {
    const startChar = document.getElementById('characterStart');
    const endChar = document.getElementById('characterEnd');
    if (!startChar || !endChar) return;

    const currentAge = parseInt(document.getElementById('currentAge').textContent);

    const startX = ageToX(currentAge);
    const startY = getYOnCurve(startX);
    startChar.style.left = startX + 'px';
    startChar.style.top = (startY - 34) + 'px';

    const endX = ageToX(100);
    const endY = getYOnCurve(endX);
    endChar.style.left = endX + 'px';
    endChar.style.top = (endY - 34) + 'px';
}

// Generate age markers positioned on curve
function generateAgeMarkers() {
    const ageMarkersDiv = document.getElementById('ageMarkers');
    if (!ageMarkersDiv) return;

    const currentAge = parseInt(document.getElementById('currentAge').textContent);
    const lifeExpectancy = 100;

    const intervals = [currentAge, 40, 50, 60, 70, 80, 90, 100];
    const uniqueIntervals = [...new Set(intervals)]
        .sort((a, b) => a - b)
        .filter(age => age >= currentAge && age <= lifeExpectancy);

    ageMarkersDiv.innerHTML = '';

    uniqueIntervals.forEach(age => {
        const marker = document.createElement('div');
        marker.className = 'age-marker';
        marker.textContent = age;

        const x = ageToX(age);
        const y = getYOnCurve(x) + 80;

        marker.style.position = 'absolute';
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        marker.style.transform = 'translateX(-50%)';

        ageMarkersDiv.appendChild(marker);
    });
}

function updateTimelineEmptyState() {
    const emptyState = document.getElementById('timelineEmptyState');
    if (!emptyState) return;
    const hasGoals = document.querySelectorAll('.goal-on-timeline').length > 0;
    emptyState.style.display = hasGoals ? 'none' : 'flex';
}

function refreshTimelineSummary() {
    const totalGoalsEl = document.getElementById('timelineTotalGoals');
    const totalBudgetEl = document.getElementById('timelineTotalBudget');
    const nextMilestoneEl = document.getElementById('timelineNextMilestone');

    if (!totalGoalsEl || !totalBudgetEl || !nextMilestoneEl) return;

    const goals = Array.from(document.querySelectorAll('.goal-on-timeline'));
    const currentAge = parseInt(document.getElementById('currentAge').textContent);
    const totalBudget = goals.reduce((sum, goal) => sum + (parseFloat(goal.dataset.amount) || 0), 0);

    let nextGoal = null;
    goals.forEach(goal => {
        const age = parseInt(goal.dataset.age);
        if (!isNaN(age) && age >= currentAge) {
            if (!nextGoal || age < nextGoal.age) {
                nextGoal = {
                    age,
                    name: goal.dataset.goalName || 'Goal'
                };
            }
        }
    });

    totalGoalsEl.textContent = goals.length.toString();
    totalBudgetEl.textContent = `₹${Math.round(totalBudget / 100000)}L`;
    nextMilestoneEl.textContent = nextGoal ? `Age ${nextGoal.age} · ${nextGoal.name}` : '--';
}

function clearGoalSelection() {
    document.querySelectorAll('.goal-on-timeline').forEach(goal => {
        goal.classList.remove('selected');
    });
    selectedGoal = null;
}

function setEditorFields(data) {
    if (!goalNameInput || !goalAgeInput || !goalBudgetInput || !goalIconInput) return;
    goalNameInput.value = data.name || '';
    goalAgeInput.value = data.age || '';
    goalBudgetInput.value = data.budget || '';
    goalIconInput.value = data.icon || '';
}

function openGoalEditor(goalElement, draftData = null) {
    if (!goalNameInput || !goalAgeInput || !goalBudgetInput || !goalIconInput) return;

    clearGoalSelection();
    draftGoal = null;

    if (goalElement) {
        selectedGoal = goalElement;
        selectedGoal.classList.add('selected');

        setEditorFields({
            name: goalElement.dataset.goalName || '',
            age: goalElement.dataset.age || '',
            budget: ((parseFloat(goalElement.dataset.amount) || 0) / 100000).toFixed(0),
            icon: goalElement.dataset.goalIcon || ''
        });

        if (goalEditorTitle) goalEditorTitle.textContent = 'Edit milestone';
        if (goalEditorHint) goalEditorHint.textContent = 'Update details and save your milestone.';
        if (goalDeleteBtn) goalDeleteBtn.classList.remove('hidden');
    } else if (draftData) {
        draftGoal = draftData;
        setEditorFields({
            name: draftData.name || '',
            age: draftData.age || '',
            budget: draftData.budget || '',
            icon: draftData.icon || ''
        });
        if (goalEditorTitle) goalEditorTitle.textContent = 'Add milestone';
        if (goalEditorHint) goalEditorHint.textContent = 'Review the details and save to place the goal.';
        if (goalDeleteBtn) goalDeleteBtn.classList.add('hidden');
    }
}

function clearGoalEditor() {
    clearGoalSelection();
    draftGoal = null;
    setEditorFields({ name: '', age: '', budget: '', icon: '' });
    if (goalEditorTitle) goalEditorTitle.textContent = 'Add a milestone';
    if (goalEditorHint) goalEditorHint.textContent = 'Select a goal to edit or drag a new one';
    if (goalDeleteBtn) goalDeleteBtn.classList.add('hidden');
}

function updateGoalElement(goalElement, data) {
    goalElement.dataset.goalName = data.name;
    goalElement.dataset.goalIcon = data.icon;
    goalElement.dataset.age = data.age;
    goalElement.dataset.amount = data.amount;
    if (data.goalType) {
        goalElement.dataset.goalType = data.goalType;
    }

    const posX = ageToX(parseInt(data.age));
    const posY = getYOnCurve(posX);
    goalElement.style.left = posX + 'px';
    goalElement.style.top = posY + 'px';

    const nameEl = goalElement.querySelector('.goal-chip-name');
    const subEl = goalElement.querySelector('.goal-chip-sub');
    const iconEl = goalElement.querySelector('.goal-chip-icon');

    if (nameEl) nameEl.textContent = data.name;
    if (subEl) subEl.textContent = `Age ${data.age} · ₹${(data.amount / 100000).toFixed(0)}L`;
    if (iconEl) iconEl.textContent = data.icon;

    goalElement.setAttribute('aria-label', `${data.name} goal`);
}

function attachGoalHandlers(goal) {
    makeGoalDraggable(goal);
    goal.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('goal-delete-btn')) return;
        openGoalEditor(goal);
    });
    goal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openGoalEditor(goal);
        }
    });

    const deleteBtn = goal.querySelector('.goal-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGoal(goal);
        });
    }
}

function createGoalElement(goalData) {
    const goal = document.createElement('div');
    goal.className = 'goal-on-timeline';
    goal.setAttribute('tabindex', '0');
    goal.setAttribute('role', 'button');
    goal.setAttribute('draggable', 'true');
    goal.setAttribute('aria-label', `${goalData.name} goal`);

    goal.dataset.goalName = goalData.name;
    goal.dataset.goalIcon = goalData.icon;
    goal.dataset.age = goalData.age;
    goal.dataset.amount = goalData.amount;
    goal.dataset.goalType = goalData.goalType;

    const posX = ageToX(parseInt(goalData.age));
    const posY = getYOnCurve(posX);
    goal.style.left = posX + 'px';
    goal.style.top = posY + 'px';

    goal.innerHTML = `
        <div class="goal-chip">
            <span class="goal-chip-icon">${goalData.icon}</span>
            <div>
                <div class="goal-chip-name">${goalData.name}</div>
                <div class="goal-chip-sub">Age ${goalData.age} · ₹${(goalData.amount / 100000).toFixed(0)}L</div>
            </div>
        </div>
        <button class="goal-delete-btn" aria-label="Delete goal">✕</button>
    `;

    attachGoalHandlers(goal);
    return goal;
}

// Initialize Page 3 timeline
function initializePage3() {
    console.log('Initializing Page 3 timeline');
    generateTimelinePath();
    generateAgeMarkers();
    positionCharacters();
    refreshTimelineSummary();
    updateTimelineEmptyState();
    setupGoalLibraryDragHandlers(); // Setup drag and drop for goal library items
    setupTimelineDropZone(); // Setup drop zone for the timeline
    console.log('Page 3 initialization complete');
}

// Debounce helper for resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Reposition existing goals on resize
function repositionExistingGoals() {
    document.querySelectorAll('.goal-on-timeline').forEach(goal => {
        const age = parseInt(goal.dataset.age);
        if (!isNaN(age)) {
            const x = ageToX(age);
            const y = getYOnCurve(x);
            goal.style.left = x + 'px';
            goal.style.top = y + 'px';
        }
    });
}

// Make goal draggable
function makeGoalDraggable(goal) {
    goal.addEventListener('dragstart', (e) => {
        isDraggingExisting = true;
        draggedGoal = goal;
        goal.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    });

    goal.addEventListener('dragend', (e) => {
        goal.style.opacity = '1';
        isDraggingExisting = false;
    });
}

// Setup drag and drop for goal library items
function setupGoalLibraryDragHandlers() {
    const items = document.querySelectorAll('.goal-icon-item');
    console.log('Setting up drag handlers for', items.length, 'goal items');

    items.forEach(item => {
        // Skip if already set up
        if (item.hasAttribute('data-drag-setup')) {
            return;
        }

        item.setAttribute('data-drag-setup', 'true');
        item.addEventListener('dragstart', (e) => {
            console.log('Drag started:', item.dataset.goalName);
            isDraggingExisting = false;
            draggedGoalData = {
                icon: item.dataset.goalIcon,
                name: item.dataset.goalName,
                defaultAge: item.dataset.goalAge,
                defaultBudget: item.dataset.goalBudget,
                goalType: item.dataset.goalType || (item.dataset.goalName || '').toLowerCase()
            };
            try {
                e.dataTransfer.setData('text/plain', JSON.stringify(draggedGoalData));
            } catch (err) {
                console.warn('Drag dataTransfer failed, using in-memory fallback.', err);
            }
            e.dataTransfer.effectAllowed = 'copy';
        });

        item.addEventListener('dragend', () => {
            draggedGoalData = null;
        });
    });
}

// Setup timeline drop zone handlers
function setupTimelineDropZone() {
    const container = document.getElementById('timelineContainer');

    if (!container) {
        console.log('Timeline container not found!');
        return;
    }

    // Remove existing handlers to prevent duplicates
    if (container.hasAttribute('data-drop-setup')) {
        console.log('Drop zone already set up');
        return;
    }

    console.log('Setting up drop zone on timeline container');
    container.setAttribute('data-drop-setup', 'true');

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = isDraggingExisting ? 'move' : 'copy';
    });

    container.addEventListener('drop', (e) => {
        console.log('Drop event triggered');
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;

        if (isDraggingExisting && draggedGoal) {
            const age = xToAge(x);
            const posX = ageToX(age);
            const posY = getYOnCurve(posX);

            draggedGoal.dataset.age = age;
            draggedGoal.style.left = posX + 'px';
            draggedGoal.style.top = posY + 'px';

            const subEl = draggedGoal.querySelector('.goal-chip-sub');
            if (subEl) {
                const amount = parseFloat(draggedGoal.dataset.amount) || 0;
                subEl.textContent = `Age ${age} · ₹${(amount / 100000).toFixed(0)}L`;
            }

            const ageInput = document.getElementById('goalAgeInput');
            if (selectedGoal === draggedGoal && ageInput) {
                ageInput.value = age;
            }

            refreshTimelineSummary();
            triggerAutoSave();
        } else {
            let goalData = null;
            try {
                const raw = e.dataTransfer.getData('text/plain');
                if (raw) {
                    goalData = JSON.parse(raw);
                }
            } catch (err) {
                console.warn('Error reading drag dataTransfer:', err);
            }

            if (!goalData && draggedGoalData) {
                goalData = draggedGoalData;
            }

            if (!goalData) {
                console.warn('No goal data found for drop.');
                return;
            }

            const inferredAge = xToAge(x);
            const age = goalData.defaultAge || inferredAge;
            const budget = goalData.defaultBudget || '50';
            const goalType = goalData.goalType || (goalData.name || '').toLowerCase();

            if (goalType === 'retirement' && retirementAdded) {
                alert('Retirement goal can only be added once!');
                return;
            }

            const newGoal = createGoalElement({
                name: goalData.name || 'Goal',
                icon: goalData.icon || '🎯',
                age,
                amount: parseFloat(budget) * 100000,
                goalType
            });

            if (goalType === 'retirement') {
                retirementAdded = true;
            }

            if (timelineContainer) {
                timelineContainer.appendChild(newGoal);
            }

            refreshTimelineSummary();
            updateTimelineEmptyState();
            triggerAutoSave();
            openGoalEditor(newGoal);
        }
    });
}

function addSavedGoalToTimeline(goalData) {
    const newGoal = createGoalElement({
        name: goalData.name,
        icon: goalData.icon,
        age: goalData.age,
        amount: parseFloat(goalData.amount),
        goalType: goalData.goalType
    });

    if (goalData.goalType === 'retirement') {
        retirementAdded = true;
    }

    if (timelineContainer) {
        timelineContainer.appendChild(newGoal);
    }
    refreshTimelineSummary();
    updateTimelineEmptyState();
}

function deleteGoal(goalElement) {
    const goalType = goalElement.dataset.goalType;

    if (confirm('Are you sure you want to delete this goal?')) {
        if (goalType === 'retirement') {
            retirementAdded = false;
        }
        goalElement.remove();
        clearGoalEditor();
        refreshTimelineSummary();
        updateTimelineEmptyState();
        triggerAutoSave();
    }
}

function saveGoalFromEditor() {
    if (!goalNameInput || !goalAgeInput || !goalBudgetInput || !goalIconInput) return;

    const name = goalNameInput.value.trim();
    const icon = goalIconInput.value.trim() || '🎯';
    const age = parseInt(goalAgeInput.value);
    const budgetLakhs = parseFloat(goalBudgetInput.value);
    const minAge = parseInt(document.getElementById('currentAge').textContent);

    if (!name) {
        alert('Please enter a goal name.');
        return;
    }

    if (isNaN(age) || age < minAge || age > 100) {
        alert('Age must be between current age and 100');
        return;
    }

    if (isNaN(budgetLakhs) || budgetLakhs <= 0) {
        alert('Please enter a valid budget amount.');
        return;
    }

    const amount = budgetLakhs * 100000;
    const goalType = selectedGoal
        ? selectedGoal.dataset.goalType
        : (draftGoal?.goalType || name.toLowerCase());

    if (!selectedGoal && goalType === 'retirement' && retirementAdded) {
        alert('Retirement goal can only be added once!');
        return;
    }

    if (selectedGoal) {
        updateGoalElement(selectedGoal, {
            name,
            icon,
            age,
            amount,
            goalType
        });
    } else if (timelineContainer) {
        const newGoal = createGoalElement({
            name,
            icon,
            age,
            amount,
            goalType
        });
        if (goalType === 'retirement') {
            retirementAdded = true;
        }
        timelineContainer.appendChild(newGoal);
    }

    refreshTimelineSummary();
    updateTimelineEmptyState();
    triggerAutoSave();
    clearGoalEditor();
}

if (goalSaveBtn) {
    goalSaveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveGoalFromEditor();
    });
}

if (goalCancelBtn) {
    goalCancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearGoalEditor();
    });
}

if (goalDeleteBtn) {
    goalDeleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (selectedGoal) {
            deleteGoal(selectedGoal);
        }
    });
}

function toggleGender() {
    const isMale = document.getElementById('genderToggle').checked;
    document.getElementById('characterStart').textContent = isMale ? '👨‍💼' : '👩‍💼';
    document.getElementById('characterEnd').textContent = isMale ? '👨‍🦳' : '👩‍🦳';
    triggerAutoSave();
}

function savePage3() {
    saveAllData();
    alert('✅ Milestones Goals saved!');
}

// ===== PAGE 4: FIRE CALCULATOR =====

// Indian currency formatter
function formatINR(num) {
    const absNum = Math.abs(num);
    if (absNum >= 10000000) {
        return (num / 10000000).toFixed(2) + ' Cr';
    } else if (absNum >= 100000) {
        return (num / 100000).toFixed(2) + ' L';
    } else {
        return Math.round(num).toLocaleString('en-IN');
    }
}

// Analysis tab switching
function showAnalysisTab(tab) {
    const tabs = document.querySelectorAll('.analysis-tab');
    const panels = document.querySelectorAll('.analysis-panel');

    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    if (tab === 'scenario') {
        tabs[0].classList.add('active');
        document.getElementById('scenarioPanel').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('stressPanel').classList.add('active');
    }
}

// Bind slider values to display
function bindScenarioSlider(sliderId, displayId, isCurrency = false, isPercent = false) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);

    const update = () => {
        if (isCurrency) {
            display.textContent = Math.round(slider.value).toLocaleString('en-IN');
        } else if (isPercent) {
            display.textContent = slider.value;
        } else {
            display.textContent = slider.value;
        }
        computeFIRE();
    };

    slider.addEventListener('input', update);
    update();
}

// Initialize all scenario sliders
function initScenarioSliders() {
    // Scenario Analysis sliders
    bindScenarioSlider('gapY', 'v_gapY');
    bindScenarioSlider('gapLoss', 'v_gapLoss', false, true);
    bindScenarioSlider('postLossY', 'v_postLossY');
    bindScenarioSlider('postLossPct', 'v_postLossPct', false, true);
    bindScenarioSlider('oneOff', 'v_oneOff', true);
    bindScenarioSlider('medMo', 'v_medMo', true);
    bindScenarioSlider('medY', 'v_medY');
    bindScenarioSlider('careY', 'v_careY');

    // Stress Test sliders
    bindScenarioSlider('roi', 'v_roi', false, true);
    bindScenarioSlider('infl', 'v_infl', false, true);
    bindScenarioSlider('incG', 'v_incG', false, true);
    bindScenarioSlider('expG', 'v_expG', false, true);
    bindScenarioSlider('crash', 'v_crash', false, true);
    bindScenarioSlider('svShock', 'v_svShock', false, true);
    bindScenarioSlider('maxAge', 'v_maxAge');
    bindScenarioSlider('retPct', 'v_retPct', false, true);
}

// Auto-populate from Pages 1-3 data
function populateFIREInputs() {
    const currentAge = parseInt(document.getElementById('currentAge').textContent);

    let totalAssets = 0;
    let totalLiabilities = 0;

    droppedItems.assets.forEach(item => {
        totalAssets += parseInt(item.value);
    });

    droppedItems.liabilities.forEach(item => {
        totalLiabilities += parseInt(item.value);
    });

    const netWorth = totalAssets - totalLiabilities;

    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const monthlySavings = (totalIncome - totalExpenses) / 12;

    window.fireInputs = {
        currentAge: currentAge,
        netWorth: Math.max(netWorth, 0),
        monthlySavings: Math.max(monthlySavings, 0),
        annualExpenses: totalExpenses,
        totalIncome: totalIncome
    };
}

// Core FIRE calculation engine
function computeFIRE() {
    if (!window.fireInputs) {
        populateFIREInputs();
    }

    const age = window.fireInputs.currentAge;
    const nw = window.fireInputs.netWorth;
    const ms = window.fireInputs.monthlySavings;
    const exp = window.fireInputs.annualExpenses;

    const retPct = parseFloat(document.getElementById('retPct').value) / 100;
    const roi = parseFloat(document.getElementById('roi').value) / 100;
    const infl = parseFloat(document.getElementById('infl').value) / 100;
    const incG = parseFloat(document.getElementById('incG').value) / 100;
    const expG = parseFloat(document.getElementById('expG').value) / 100;
    const crash = parseFloat(document.getElementById('crash').value) / 100;
    const svShock = parseFloat(document.getElementById('svShock').value) / 100;
    const maxAge = parseInt(document.getElementById('maxAge').value);

    const gapY = parseInt(document.getElementById('gapY').value);
    const gapLoss = parseFloat(document.getElementById('gapLoss').value) / 100;
    const postLossY = parseInt(document.getElementById('postLossY').value);
    const postLossPct = parseFloat(document.getElementById('postLossPct').value) / 100;
    const oneOff = parseFloat(document.getElementById('oneOff').value);
    const medMo = parseFloat(document.getElementById('medMo').value);
    const medY = parseInt(document.getElementById('medY').value);
    const careY = parseInt(document.getElementById('careY').value);

    const retireExpToday = exp * retPct;
    const fiToday = retireExpToday * 25;
    document.getElementById('fiTargetToday').textContent = '₹ ' + formatINR(fiToday);

    let wealth = nw;
    let annSave = ms * 12;
    let annExp = exp;

    for (let year = 0; year <= 100; year++) {
        const curAge = age + year;
        if (curAge > maxAge) break;

        if (year === 0 && crash > 0) {
            wealth = wealth * (1 - crash);
        }

        let saveMul = 1;

        if (year < gapY) {
            saveMul *= (1 - gapLoss);
        }

        if (year >= gapY && year < gapY + postLossY) {
            saveMul *= (1 - postLossPct);
        }

        if (year < careY) {
            saveMul = 0;
        }

        if (year < 3) {
            saveMul *= (1 - svShock);
        }

        wealth += annSave * saveMul;

        if (year === 0 && oneOff > 0) {
            wealth -= oneOff;
        }

        if (year < medY) {
            wealth -= medMo * 12;
        }

        wealth *= (1 + roi);
        annSave *= (1 + incG);
        annExp *= (1 + expG);

        const retireExpThisYear = retireExpToday * Math.pow(1 + infl, year);
        const fiTargetThisYear = retireExpThisYear * 25;

        if (wealth >= fiTargetThisYear) {
            const fireAge = age + year;
            document.getElementById('fireAgeDisplay').textContent = fireAge + ' years';
            document.getElementById('timeToFI').textContent = year + (year === 1 ? ' year' : ' years');
            document.getElementById('nwAtFI').textContent = '₹ ' + formatINR(wealth);
            document.getElementById('fiStatus').textContent = 'On Track ✓';
            document.getElementById('fiStatus').style.color = 'var(--emerald)';
            return;
        }
    }

    document.getElementById('fireAgeDisplay').textContent = 'Not by ' + maxAge;
    document.getElementById('timeToFI').textContent = '—';
    document.getElementById('nwAtFI').textContent = '—';
    document.getElementById('fiStatus').textContent = 'Needs Adjustment ⚠️';
    document.getElementById('fiStatus').style.color = 'var(--ruby)';
}

function showSaveConfirmation() {
    alert('✅ All data saved!');
    createConfetti();
}

function finishApp() {
    alert('🎉 Congratulations! Your financial plan is complete!\n\nYou can now review your:\n✓ Income & Expenses\n✓ Assets & Liabilities\n✓ Life Goals Timeline\n✓ FIRE Analysis & Scenarios');
    createConfetti();
}

// ===== PAGE LOAD INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    initializePage3();

    // Create initial particles
    setTimeout(() => {
        createVaultParticles();
    }, 1000);
});

// Handle window resize for timeline responsiveness
window.addEventListener('resize', debounce(() => {
    generateTimelinePath();
    generateAgeMarkers();
    positionCharacters();
    repositionExistingGoals();
}, 250));
