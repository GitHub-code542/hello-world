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
                updateBalanceSheet();
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
        data.timeline.goals.push({
            icon: goal.querySelector('.goal-icon-big').textContent.trim().charAt(0),
            name: goal.querySelector('.goal-label').textContent.split('\n')[0].trim(),
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

    // Update navigation progress
    document.querySelectorAll('.nav-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 < pageNum) {
            step.classList.add('completed');
        } else if (index + 1 === pageNum) {
            step.classList.add('active');
        } else {
            step.classList.remove('completed');
        }
    });

    window.scrollTo(0, 0);

    // Trigger particle effects on vault
    if (pageNum === 1) {
        createVaultParticles();
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

// ===== PAGE 3: TIMELINE GOALS =====
let draggedGoal = null;
let isDraggingExisting = false;
let retirementAdded = false;

// Generate age markers
function generateAgeMarkers() {
    const ageMarkersDiv = document.getElementById('ageMarkers');
    const currentAge = parseInt(document.getElementById('currentAge').textContent);
    const lifeExpectancy = 100;

    const intervals = [currentAge, 40, 50, 60, 70, 80, 90, 100];
    const uniqueIntervals = [...new Set(intervals)].sort((a, b) => a - b).filter(age => age >= currentAge && age <= lifeExpectancy);

    ageMarkersDiv.innerHTML = '';
    uniqueIntervals.forEach(age => {
        const marker = document.createElement('div');
        marker.className = 'age-marker';
        marker.textContent = age;
        ageMarkersDiv.appendChild(marker);
    });
}

generateAgeMarkers();

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

// Make goal icons draggable
document.querySelectorAll('.goal-icon-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        isDraggingExisting = false;
        const goalData = {
            icon: item.dataset.goalIcon,
            name: item.dataset.goalName
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(goalData));
        e.dataTransfer.effectAllowed = 'copy';
    });
});

// Make timeline container a drop zone
const timelineContainer = document.getElementById('timelineContainer');

timelineContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = isDraggingExisting ? 'move' : 'copy';
});

timelineContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const rect = timelineContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingExisting && draggedGoal) {
        draggedGoal.style.left = x + 'px';
        draggedGoal.style.top = y + 'px';
        triggerAutoSave();
    } else {
        try {
            const goalData = JSON.parse(e.dataTransfer.getData('text/plain'));
            addNewGoalToTimeline(goalData, x, y);
        } catch (err) {
            console.error('Error adding goal:', err);
        }
    }
});

function addNewGoalToTimeline(goalData, x, y) {
    if (goalData.name === 'Retirement' && retirementAdded) {
        alert('Retirement goal can only be added once!');
        return;
    }

    const defaultAge = goalData.name === 'Retirement' ? '60' : '40';
    const age = prompt(`Enter age for this goal:`, defaultAge);
    if (!age) return;

    const amount = prompt('Enter budget amount (in Lakhs):', '50');
    if (!amount) return;

    const newGoal = document.createElement('div');
    newGoal.className = 'goal-on-timeline';
    newGoal.draggable = true;
    newGoal.style.left = x + 'px';
    newGoal.style.top = y + 'px';
    newGoal.dataset.age = age;
    newGoal.dataset.amount = parseFloat(amount) * 100000;
    newGoal.dataset.goalType = goalData.name.toLowerCase();

    newGoal.innerHTML = `
        <div class="goal-icon-big">
            ${goalData.icon}
            <button class="goal-delete-btn" onclick="deleteGoal(event, this.closest('.goal-on-timeline'))">✕</button>
        </div>
        <div class="goal-label" onclick="editGoal(event, this.closest('.goal-on-timeline'))">
            ${goalData.name}<br>
            Age ${age}<br>
            Budget ₹${amount} Lacs
        </div>
    `;

    if (goalData.name === 'Retirement') {
        retirementAdded = true;
    }

    makeGoalDraggable(newGoal);
    timelineContainer.appendChild(newGoal);
    triggerAutoSave();
}

function addSavedGoalToTimeline(goalData) {
    const newGoal = document.createElement('div');
    newGoal.className = 'goal-on-timeline';
    newGoal.draggable = true;
    newGoal.style.left = goalData.left;
    newGoal.style.top = goalData.top;
    newGoal.dataset.age = goalData.age;
    newGoal.dataset.amount = goalData.amount;
    newGoal.dataset.goalType = goalData.goalType;

    newGoal.innerHTML = `
        <div class="goal-icon-big">
            ${goalData.icon}
            <button class="goal-delete-btn" onclick="deleteGoal(event, this.closest('.goal-on-timeline'))">✕</button>
        </div>
        <div class="goal-label" onclick="editGoal(event, this.closest('.goal-on-timeline'))">
            ${goalData.name}<br>
            Age ${goalData.age}<br>
            Budget ₹${(goalData.amount / 100000).toFixed(0)} Lacs
        </div>
    `;

    if (goalData.goalType === 'retirement') {
        retirementAdded = true;
    }

    makeGoalDraggable(newGoal);
    timelineContainer.appendChild(newGoal);
}

function deleteGoal(event, goalElement) {
    event.stopPropagation();
    const goalType = goalElement.dataset.goalType;

    if (confirm('Are you sure you want to delete this goal?')) {
        if (goalType === 'retirement') {
            retirementAdded = false;
        }
        goalElement.remove();
        triggerAutoSave();
    }
}

function editGoal(event, goalElement) {
    event.stopPropagation();
    const currentAge = goalElement.dataset.age;
    const currentAmount = goalElement.dataset.amount;

    const newAge = prompt('Edit age for this goal:', currentAge);
    if (!newAge) return;

    const newAmount = prompt('Edit budget amount (in Lakhs):', (parseFloat(currentAmount) / 100000).toFixed(0));
    if (!newAmount) return;

    goalElement.dataset.age = newAge;
    goalElement.dataset.amount = parseFloat(newAmount) * 100000;

    const label = goalElement.querySelector('.goal-label');
    const lines = label.innerHTML.split('<br>');
    lines[1] = `Age ${newAge}`;
    lines[2] = `Budget ₹${newAmount} Lacs`;

    label.onclick = function(e) { editGoal(e, goalElement); };
    label.innerHTML = lines.join('<br>');
    triggerAutoSave();
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
    generateAgeMarkers();

    // Create initial particles
    setTimeout(() => {
        createVaultParticles();
    }, 1000);
});
