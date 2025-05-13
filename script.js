// Game constants
const INITIAL_MONEY = 100;
const INITIAL_UNLOCKED_CROPS = ["carrot", "potato", "tomato"]; // Start with just these basic crops

const CROPS = {
    // Vegetables
    carrot: {
        growthTime: 5000, // milliseconds (for demo purposes, would be longer in a real game)
        cost: 10,
        profit: 25,
        type: 'vegetable',
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🥕'  // grown
        ]
    },
    tomato: {
        growthTime: 8000,
        cost: 15,
        profit: 35,
        type: 'vegetable',
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🍅'  // grown
        ]
    },
    pumpkin: {
        growthTime: 12000,
        cost: 20,
        profit: 50,
        type: 'vegetable',
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🎃'  // grown
        ]
    },
    // New Vegetables
    corn: {
        growthTime: 7000,
        cost: 12,
        profit: 30,
        type: 'vegetable',
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🌽'  // grown
        ]
    },
    eggplant: {
        growthTime: 10000,
        cost: 18,
        profit: 45,
        type: 'vegetable',
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🍆'  // grown
        ]
    },
    potato: {
        growthTime: 6000,
        cost: 8,
        profit: 22,
        type: 'vegetable',
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🥔'  // grown
        ]
    },
    // Flower types with special effects
    sunflower: {
        growthTime: 9000,
        cost: 25,
        profit: 40,
        type: 'flower',
        specialEffect: 'money',  // Increases daily money bonus
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🌻'  // grown
        ]
    },
    tulip: {
        growthTime: 6000,
        cost: 20,
        profit: 35,
        type: 'flower',
        specialEffect: 'growth', // Speeds up adjacent plants
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🌷'  // grown
        ]
    },
    // Rare seed with high reward
    goldenRose: {
        growthTime: 15000,
        cost: 50,
        profit: 150,
        type: 'rare',
        stages: [
            '✨', // magical seed
            '🌱', // sprouting
            '🌹'  // golden rose (using regular rose emoji)
        ]
    }
};

const WEATHER_TYPES = [
    { icon: '☀️', text: 'Sunny', growthBonus: 1.2 },
    { icon: '⛅', text: 'Partly Cloudy', growthBonus: 1.0 },
    { icon: '🌧️', text: 'Rainy', growthBonus: 1.5 },
    { icon: '🌫️', text: 'Foggy', growthBonus: 0.8 }
];

// Game state
let gameState = {
    money: INITIAL_MONEY,
    selectedSeed: 'carrot',
    day: 1,
    weather: WEATHER_TYPES[0],
    plots: [],
    inventory: {}, // Stores harvested crops: {cropName: count}
    unlockedSeeds: [...INITIAL_UNLOCKED_CROPS] // Array of seed names that are unlocked
};

// DOM elements
const farmGrid = document.getElementById('farm-grid');
const coinsDisplay = document.getElementById('coins');
const seedElements = document.querySelectorAll('.seed');
const tabButtons = document.querySelectorAll('.tab-btn');
const mainTabButtons = document.querySelectorAll('.main-tab-btn');
const seedContainers = document.querySelectorAll('.seed-container');
const mainTabContainers = document.querySelectorAll('.main-tab-container');
const nextDayButton = document.getElementById('next-day');
const dayCountDisplay = document.getElementById('day-count');
const weatherIcon = document.getElementById('weather-icon');
const weatherText = document.getElementById('weather-text');
const journalEntries = document.getElementById('journal-entries');
const notification = document.getElementById('notification');
const splashScreen = document.getElementById('splash-screen');
const continueGameButton = document.getElementById('continue-game');
const newGameButton = document.getElementById('new-game');
const backgroundSound = document.getElementById('background-sound');
const soundControl = document.getElementById('sound-control');
const plantSound = document.getElementById('plant-sound');
const harvestSound = document.getElementById('harvest-sound');
const confirmModal = document.getElementById('confirm-modal');
const confirmYesButton = document.getElementById('confirm-yes');
const confirmNoButton = document.getElementById('confirm-no');
const inventoryContainer = document.getElementById('player-inventory');
const sellInventoryContainer = document.getElementById('sell-inventory');
const buySeedsContainer = document.getElementById('buy-seeds');

// Initialize game
function initGame() {
    createPlots();
    setupEventListeners();
    checkSavedGame();
}

// Set up all event listeners
function setupEventListeners() {
    console.log("Setting up event listeners");

    // Set up seed selection
    document.querySelectorAll('.seed').forEach(seed => {
        seed.addEventListener('click', () => {
            const seedType = seed.dataset.seed;
            // Only allow selection if seed is unlocked
            if (gameState.unlockedSeeds.includes(seedType)) {
                selectSeed(seedType);
            } else {
                showNotification("This seed variety is locked! Buy it in the shop.");
            }
        });
    });

    // Set up seed tab switching
    tabButtons.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Set up main tab switching with individual handlers for reliability
    document.querySelector('[data-main-tab="seeds"]').addEventListener('click', () => switchMainTab('seeds'));
    document.querySelector('[data-main-tab="inventory"]').addEventListener('click', () => switchMainTab('inventory'));
    document.querySelector('[data-main-tab="shop"]').addEventListener('click', () => switchMainTab('shop'));

    // Set up next day button
    nextDayButton.addEventListener('click', startNextDay);

    // Set up splash screen buttons
    continueGameButton.addEventListener('click', continueGame);
    newGameButton.addEventListener('click', promptNewGame);

    // Set up confirmation modal buttons
    confirmYesButton.addEventListener('click', startNewGame);
    confirmNoButton.addEventListener('click', closeModal);
}

// Check if a saved game exists and update UI accordingly
function checkSavedGame() {
    const savedData = localStorage.getItem('cozyGardenGame');

    if (savedData) {
        // Show the continue game button if we have saved data
        continueGameButton.style.display = 'inline-block';
    } else {
        // Hide the continue button if no saved data
        continueGameButton.style.display = 'none';
        // Auto-start a new game
        startNewGame();
    }

    // Fix issue where buttons click handler might not be attached
    document.querySelector('.main-tabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('main-tab-btn')) {
            switchMainTab(e.target.dataset.mainTab);
        }
    });
}

// Continue a saved game
function continueGame() {
    loadGame();
    updateUI();
    updateInventoryUI();
    updateShopUI();
    hideSplashScreen();
}

// Start a new game
function startNewGame() {
    resetGameState();
    createPlots();
    updateUI();
    updateInventoryUI();
    updateShopUI();
    hideSplashScreen();
    closeModal();
    addJournalEntry('Starting a fresh garden! The weather is perfect for planting.');
}

// Prompt for confirmation before starting a new game
function promptNewGame() {
    const savedData = localStorage.getItem('cozyGardenGame');

    if (savedData) {
        // Show confirmation modal
        confirmModal.classList.add('visible');
    } else {
        // No saved game, start new game directly
        startNewGame();
    }
}

// Close the confirmation modal
function closeModal() {
    confirmModal.classList.remove('visible');
}

// Hide the splash screen
function hideSplashScreen() {
    // Play background sound only if sound is enabled
    if (isSoundOn) {
        backgroundSound.play().catch(error => {
            console.log('Audio autoplay was prevented, click sound control to start audio');
        });
    }

    // Hide splash screen with fade effect
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 500);

    // Enable game container interactions
    document.querySelector('.game-container').style.pointerEvents = 'auto';
}

// Reset to initial game state
function resetGameState() {
    // Wipe persistent data
    localStorage.removeItem('cozyGardenGame');

    // Reset to initial state
    gameState = {
        money: INITIAL_MONEY,
        selectedSeed: 'carrot',
        day: 1,
        weather: WEATHER_TYPES[0],
        plots: [],
        inventory: {},
        unlockedSeeds: [...INITIAL_UNLOCKED_CROPS]
    };
}

// Switch between seed tabs
function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update seed containers
    seedContainers.forEach(container => {
        container.classList.toggle('active', container.id === `${tabName}-tab`);
    });
}

// Switch between main tabs (Seeds, Inventory, Shop)
function switchMainTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);

    // Update main tab buttons
    mainTabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mainTab === tabName);
    });

    // Update main tab containers
    mainTabContainers.forEach(container => {
        container.classList.toggle('active', container.id === `${tabName}-main-tab`);
    });

    // Update specific tab content if needed
    if (tabName === 'inventory') {
        updateInventoryUI();
    } else if (tabName === 'shop') {
        updateShopUI();
    }

    // Force a reflow to ensure UI updates
    document.body.offsetHeight;
}

// Create farm plots
function createPlots() {
    // Clear existing plots from the DOM
    farmGrid.innerHTML = '';

    // Reset plots array
    gameState.plots = [];

    const gridSize = 5; // 5x5 grid
    for (let i = 0; i < gridSize * gridSize; i++) {
        const plot = document.createElement('div');
        plot.className = 'plot empty';
        plot.dataset.index = i;

        // Initialize plot state
        gameState.plots[i] = {
            state: 'empty',
            crop: null,
            growthProgress: 0,
            growthTimer: null
        };

        plot.addEventListener('click', () => handlePlotClick(i));
        farmGrid.appendChild(plot);
    }

    console.log(`Created ${gameState.plots.length} plots`);
}

// Handle plot click
function handlePlotClick(plotIndex) {
    const plot = gameState.plots[plotIndex];
    const plotElement = document.querySelector(`.plot[data-index="${plotIndex}"]`);

    if (plot.state === 'empty') {
        // Plant a seed
        if (gameState.money >= CROPS[gameState.selectedSeed].cost) {
            plantSeed(plotIndex, plotElement);
        } else {
            showNotification("Not enough money!");
        }
    } else if (plot.state === 'grown') {
        // Harvest the crop
        harvestCrop(plotIndex, plotElement);
    } else {
        // Plot is growing
        const growthPercent = Math.round((plot.growthProgress / CROPS[plot.crop].growthTime) * 100);
        showNotification(`${plot.crop.charAt(0).toUpperCase() + plot.crop.slice(1)} is ${growthPercent}% grown`);
    }
}

// Plant a seed
function plantSeed(plotIndex, plotElement) {
    const selectedCrop = gameState.selectedSeed;
    const cropData = CROPS[selectedCrop];

    // Play planting sound
    playSound(plantSound);

    // Deduct cost
    gameState.money -= cropData.cost;
    updateMoney();

    // Update plot state
    gameState.plots[plotIndex] = {
        state: 'planted',
        crop: selectedCrop,
        growthProgress: 0,
        growthTimer: null
    };

    // Update plot appearance
    plotElement.className = 'plot planted';
    plotElement.innerHTML = `
        <span class="crop-emoji">${cropData.stages[0]}</span>
        <div class="growth-indicator" style="width: 0%"></div>
    `;

    // Start growth timer
    startGrowthTimer(plotIndex, plotElement);

    // Add journal entry
    addJournalEntry(`Planted ${selectedCrop} seeds.`);
    showNotification(`Planted ${selectedCrop}!`);

    // Save game
    saveGame();
}

// Start growth timer for a plant
function startGrowthTimer(plotIndex, plotElement) {
    const plot = gameState.plots[plotIndex];
    const cropData = CROPS[plot.crop];

    const growthIndicator = plotElement.querySelector('.growth-indicator');

    const updateGrowth = () => {
        if (plot.state === 'planted') {
            // Base growth amount
            let growthAmount = 100 * gameState.weather.growthBonus;

            // Check for adjacent tulips (growth boosters)
            const hasTulipBoost = hasAdjacentTulips(plotIndex);
            if (hasTulipBoost) {
                growthAmount *= 1.3; // 30% growth boost
                plotElement.setAttribute('data-boosted', 'true');
                if (!plot.boostedByTulip) {
                    plot.boostedByTulip = true;
                    addJournalEntry(`Your ${plot.crop} is growing faster thanks to nearby tulips!`);
                }
            } else {
                plotElement.removeAttribute('data-boosted');
            }

            // Increase growth
            plot.growthProgress += growthAmount;

            // Update growth indicator
            const progressPercent = Math.min(100, (plot.growthProgress / cropData.growthTime) * 100);
            growthIndicator.style.width = `${progressPercent}%`;

            // Check if mid-growth stage
            if (plot.growthProgress >= cropData.growthTime / 2 && plotElement.querySelector('.crop-emoji').textContent !== cropData.stages[1]) {
                plotElement.querySelector('.crop-emoji').textContent = cropData.stages[1];
            }

            // Check if fully grown
            if (plot.growthProgress >= cropData.growthTime) {
                plot.state = 'grown';
                plotElement.className = 'plot grown';
                plotElement.querySelector('.crop-emoji').textContent = cropData.stages[2];
                growthIndicator.style.width = '100%';
                clearInterval(plot.growthTimer);

                // Special visual effect for golden rose
                if (plot.crop === 'goldenRose') {
                    plotElement.classList.add('rare-plant');
                    addJournalEntry(`Your rare golden rose has bloomed! It shimmers with magical energy!`);
                } else {
                    addJournalEntry(`Your ${plot.crop} is ready for harvest!`);
                }

                showNotification(`${plot.crop.charAt(0).toUpperCase() + plot.crop.slice(1)} has grown!`);
                saveGame();
                return;
            }

            saveGame();
        } else {
            clearInterval(plot.growthTimer);
        }
    };

    plot.growthTimer = setInterval(updateGrowth, 500);
    gameState.plots[plotIndex].growthTimer = plot.growthTimer;
}

// Check if a plot has adjacent tulips
function hasAdjacentTulips(plotIndex) {
    const gridSize = 5; // 5x5 grid
    const adjacentIndices = [];

    // Calculate row and column of current plot
    const row = Math.floor(plotIndex / gridSize);
    const col = plotIndex % gridSize;

    // Check all adjacent plots (horizontally, vertically, and diagonally)
    for (let r = Math.max(0, row - 1); r <= Math.min(gridSize - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(gridSize - 1, col + 1); c++) {
            const adjacentIndex = r * gridSize + c;
            if (adjacentIndex !== plotIndex) {
                adjacentIndices.push(adjacentIndex);
            }
        }
    }

    // Check if any adjacent plot has a grown tulip
    return adjacentIndices.some(index => {
        const adjPlot = gameState.plots[index];
        return adjPlot &&
               (adjPlot.state === 'grown' || adjPlot.state === 'planted') &&
               adjPlot.crop === 'tulip';
    });
}

// Harvest a crop
function harvestCrop(plotIndex, plotElement) {
    const plot = gameState.plots[plotIndex];
    const cropData = CROPS[plot.crop];

    // Play harvest sound
    playSound(harvestSound);

    // Add to inventory instead of directly selling
    addToInventory(plot.crop);

    // Reset plot
    gameState.plots[plotIndex] = {
        state: 'empty',
        crop: null,
        growthProgress: 0,
        growthTimer: null
    };

    // Update plot appearance
    plotElement.className = 'plot empty';
    plotElement.innerHTML = '';

    // Add journal entry
    addJournalEntry(`Harvested ${plot.crop} and added to inventory.`);
    showNotification(`Harvested ${plot.crop}! Added to inventory.`);

    // Update inventory UI
    updateInventoryUI();

    // Save game
    saveGame();
}

// Add a crop to inventory
function addToInventory(cropName) {
    if (!gameState.inventory[cropName]) {
        gameState.inventory[cropName] = 0;
    }
    gameState.inventory[cropName]++;
}

// Sell a crop from inventory
function sellCrop(cropName, amount = 1) {
    // Check if we have enough in inventory
    if (!gameState.inventory[cropName] || gameState.inventory[cropName] < amount) {
        showNotification("Not enough items to sell!");
        return;
    }

    const cropData = CROPS[cropName];
    const profit = cropData.profit * amount;

    // Update inventory and money
    gameState.inventory[cropName] -= amount;
    if (gameState.inventory[cropName] <= 0) {
        delete gameState.inventory[cropName]; // Remove from inventory if count reaches 0
    }

    gameState.money += profit;
    updateMoney();

    // Add journal entry
    addJournalEntry(`Sold ${amount} ${cropName}${amount > 1 ? 's' : ''} for ${profit} coins.`);
    showNotification(`Sold ${cropName}! +${profit} coins!`);

    // Update UI
    updateInventoryUI();
    updateShopUI();

    // Save game
    saveGame();
}

// Buy a seed variety to unlock it
function unlockSeed(seedName) {
    const cropData = CROPS[seedName];

    // Check if player has enough money
    if (gameState.money < cropData.cost * 5) { // Make unlocking more expensive than buying one seed
        showNotification("Not enough money to unlock this seed!");
        return;
    }

    // Check if it's already unlocked
    if (gameState.unlockedSeeds.includes(seedName)) {
        showNotification("This seed is already unlocked!");
        return;
    }

    // Unlock the seed
    gameState.unlockedSeeds.push(seedName);
    gameState.money -= cropData.cost * 5;
    updateMoney();

    // Update UI
    updateSeedAvailability();

    // Add journal entry
    addJournalEntry(`Unlocked ${seedName} seeds! New variety available for planting.`);
    showNotification(`Unlocked ${seedName}!`);

    // Save game
    saveGame();
}

// Update inventory UI
function updateInventoryUI() {
    // Clear inventory containers
    inventoryContainer.innerHTML = '';
    sellInventoryContainer.innerHTML = '';

    const inventoryEmpty = Object.keys(gameState.inventory).length === 0;

    if (inventoryEmpty) {
        inventoryContainer.innerHTML = '<p class="empty-inventory-message">Your harvested crops will appear here.</p>';
        sellInventoryContainer.innerHTML = '<p class="empty-inventory-message">You have no crops to sell.</p>';
        return;
    }

    // Add items to both inventory displays
    for (const [cropName, count] of Object.entries(gameState.inventory)) {
        const cropData = CROPS[cropName];

        // Create inventory item
        const inventoryItem = createInventoryItem(cropName, count);
        inventoryContainer.appendChild(inventoryItem);

        // Create sell inventory item with button
        const sellItem = createInventoryItem(cropName, count, true);
        sellInventoryContainer.appendChild(sellItem);
    }
}

// Create an inventory item element
function createInventoryItem(cropName, count, forSelling = false) {
    const cropData = CROPS[cropName];
    const item = document.createElement('div');
    item.className = 'inventory-item';

    // Get the grown stage emoji
    const cropEmoji = cropData.stages[cropData.stages.length - 1];

    item.innerHTML = `
        <span class="crop-emoji">${cropEmoji}</span>
        <span class="crop-name">${cropName}</span>
        <span class="crop-count">${count}</span>
        ${forSelling ? `
            <span class="sell-price">${cropData.profit}
                <span class="tiny-icon">🪙</span>
            </span>
            <button class="sell-btn" data-crop="${cropName}">Sell</button>
        ` : ''}
    `;

    if (forSelling) {
        const sellButton = item.querySelector('.sell-btn');
        sellButton.addEventListener('click', () => sellCrop(cropName));
    }

    return item;
}

// Update shop UI - seeds to buy
function updateShopUI() {
    buySeedsContainer.innerHTML = '';

    // Get all seed types
    const allSeeds = Object.keys(CROPS);
    const lockedSeeds = allSeeds.filter(seed => !gameState.unlockedSeeds.includes(seed));

    if (lockedSeeds.length === 0) {
        buySeedsContainer.innerHTML = '<p class="empty-inventory-message">All seed varieties are unlocked!</p>';
        return;
    }

    // Add locked seeds to buy
    for (const seedName of lockedSeeds) {
        const cropData = CROPS[seedName];
        const unlockPrice = cropData.cost * 5; // 5x the seed cost to unlock

        const seedItem = document.createElement('div');
        seedItem.className = 'inventory-item';

        seedItem.innerHTML = `
            <span class="crop-emoji">${cropData.stages[cropData.stages.length - 1]}</span>
            <span class="crop-name">${seedName}</span>
            <span class="sell-price">${unlockPrice}
                <span class="tiny-icon">🪙</span>
            </span>
            <button class="buy-btn" data-seed="${seedName}">Unlock</button>
        `;

        const buyButton = seedItem.querySelector('.buy-btn');
        buyButton.addEventListener('click', () => unlockSeed(seedName));

        // Disable button if player doesn't have enough money
        if (gameState.money < unlockPrice) {
            buyButton.disabled = true;
            buyButton.textContent = 'Not enough';
            buyButton.style.backgroundColor = '#9e9e9e';
        }

        buySeedsContainer.appendChild(seedItem);
    }
}

// Update seed availability based on unlocked seeds
function updateSeedAvailability() {
    document.querySelectorAll('.seed').forEach(seed => {
        const seedType = seed.dataset.seed;

        if (gameState.unlockedSeeds.includes(seedType)) {
            seed.classList.remove('disabled');
        } else {
            seed.classList.add('disabled');
        }
    });
}

// Select a seed type
function selectSeed(seedType) {
    gameState.selectedSeed = seedType;

    // Update UI - need to select all seeds across all tabs
    document.querySelectorAll('.seed').forEach(seed => {
        if (seed.dataset.seed === seedType) {
            seed.classList.add('selected');

            // Switch to the appropriate tab if not currently visible
            const parentTab = seed.closest('.seed-container');
            if (parentTab && !parentTab.classList.contains('active')) {
                const tabId = parentTab.id;
                const tabName = tabId.replace('-tab', '');
                switchTab(tabName);
            }
        } else {
            seed.classList.remove('selected');
        }
    });

    showNotification(`Selected ${seedType} seeds`);
}

// Start the next day
function startNextDay() {
    gameState.day++;
    changeWeather();

    // Calculate daily bonus
    let dailyBonus = 5; // Base daily bonus

    // Check for sunflowers (money boosters)
    const sunflowerCount = countPlantsByType('sunflower', 'grown');
    if (sunflowerCount > 0) {
        const sunflowerBonus = sunflowerCount * 3; // Each sunflower adds 3 coins
        dailyBonus += sunflowerBonus;
        addJournalEntry(`Your sunflowers generated an extra ${sunflowerBonus} coins today!`);
    }

    // Add the daily bonus
    gameState.money += dailyBonus;

    // Update UI
    dayCountDisplay.textContent = `Day ${gameState.day}`;
    updateMoney();

    // Add journal entry
    addJournalEntry(`Day ${gameState.day} begins. Weather is ${gameState.weather.text}.`);
    showNotification(`Good morning! It's Day ${gameState.day}`);

    saveGame();
}

// Count plants by type and state
function countPlantsByType(cropType, state) {
    return gameState.plots.reduce((count, plot) => {
        if (plot.crop === cropType && plot.state === state) {
            return count + 1;
        }
        return count;
    }, 0);
}

// Change weather randomly
function changeWeather() {
    const previousWeather = gameState.weather;

    // Don't repeat the same weather
    let newWeather;
    do {
        newWeather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
    } while (newWeather === previousWeather && WEATHER_TYPES.length > 1);

    gameState.weather = newWeather;

    // Update weather UI
    weatherIcon.textContent = newWeather.icon;
    weatherText.textContent = newWeather.text;

    // Add weather effect to journal
    const weatherEffect = newWeather.growthBonus > 1
        ? 'Plants will grow faster.'
        : newWeather.growthBonus < 1
            ? 'Plants will grow slower.'
            : 'Plant growth is normal.';

    addJournalEntry(`The weather changed to ${newWeather.text}. ${weatherEffect}`);
}

// Add entry to the journal
function addJournalEntry(text) {
    const entry = document.createElement('p');
    entry.textContent = `Day ${gameState.day}: ${text}`;
    journalEntries.prepend(entry);

    // Keep only the last 10 entries
    while (journalEntries.children.length > 10) {
        journalEntries.removeChild(journalEntries.lastChild);
    }
}

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('visible');

    setTimeout(() => {
        notification.classList.remove('visible');
    }, 2000);
}

// Update money display
function updateMoney() {
    coinsDisplay.textContent = gameState.money;
}

// Update all UI elements
function updateUI() {
    coinsDisplay.textContent = gameState.money;
    dayCountDisplay.textContent = `Day ${gameState.day}`;
    weatherIcon.textContent = gameState.weather.icon;
    weatherText.textContent = gameState.weather.text;

    // Set selected seed
    seedElements.forEach(seed => {
        seed.classList.toggle('selected', seed.dataset.seed === gameState.selectedSeed);
    });
}

// Save game state to localStorage
function saveGame() {
    // Clone gameState to avoid saving timers
    const saveData = JSON.parse(JSON.stringify(gameState));

    // Remove timer references which can't be serialized
    saveData.plots.forEach(plot => {
        delete plot.growthTimer;
    });

    localStorage.setItem('cozyGardenGame', JSON.stringify(saveData));
}

// Load game state from localStorage
function loadGame() {
    const savedData = localStorage.getItem('cozyGardenGame');

    if (savedData) {
        const loadedData = JSON.parse(savedData);

        // Restore basic state
        gameState.money = loadedData.money;
        gameState.selectedSeed = loadedData.selectedSeed;
        gameState.day = loadedData.day;
        gameState.weather = loadedData.weather;

        // Restore inventory and unlocked seeds (newer properties)
        gameState.inventory = loadedData.inventory || {};
        gameState.unlockedSeeds = loadedData.unlockedSeeds || [...INITIAL_UNLOCKED_CROPS];

        // Restore plots
        loadedData.plots.forEach((loadedPlot, index) => {
            gameState.plots[index].state = loadedPlot.state;
            gameState.plots[index].crop = loadedPlot.crop;
            gameState.plots[index].growthProgress = loadedPlot.growthProgress;

            // Update plot appearance
            const plotElement = document.querySelector(`.plot[data-index="${index}"]`);
            if (loadedPlot.state === 'planted' || loadedPlot.state === 'grown') {
                const cropData = CROPS[loadedPlot.crop];
                let stageIndex = 0;
                let className = 'plot planted';

                if (loadedPlot.state === 'grown') {
                    stageIndex = 2;
                    className = 'plot grown';
                } else if (loadedPlot.growthProgress >= CROPS[loadedPlot.crop].growthTime / 2) {
                    stageIndex = 1;
                }

                plotElement.className = className;
                plotElement.innerHTML = `
                    <span class="crop-emoji">${cropData.stages[stageIndex]}</span>
                    <div class="growth-indicator" style="width: ${(loadedPlot.growthProgress / cropData.growthTime) * 100}%"></div>
                `;

                // Restart growth timer if not yet grown
                if (loadedPlot.state === 'planted') {
                    startGrowthTimer(index, plotElement);
                }
            } else {
                plotElement.className = 'plot empty';
                plotElement.innerHTML = '';
            }
        });

        addJournalEntry('Game loaded successfully.');
    } else {
        // First time playing
        addJournalEntry('Welcome to your cozy garden! Click on a plot to plant seeds.');
    }

    // Update seed availability based on unlocked seeds
    updateSeedAvailability();
}

// Create styles for emoji display
function createEmojiStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .crop-emoji {
            font-size: 2rem;
            line-height: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .seed-emoji {
            font-size: 1.8rem;
            display: block;
            margin-bottom: 5px;
        }
    `;
    document.head.appendChild(style);
}

// Sound Management
let isSoundOn = true;
const volumeSlider = document.getElementById('volume-slider');

function toggleSound() {
    if (isSoundOn) {
        backgroundSound.pause();
        soundControl.textContent = '🔇';
    } else {
        backgroundSound.play();
        soundControl.textContent = '🔊';
    }
    isSoundOn = !isSoundOn;

    // Save sound state preference to localStorage
    localStorage.setItem('cozyGardenSoundOn', isSoundOn ? 'true' : 'false');
}

function updateVolume() {
    backgroundSound.volume = volumeSlider.value;
    // Save volume preference to localStorage
    localStorage.setItem('cozyGardenVolume', volumeSlider.value);
}

// Play a sound effect if sound is enabled
function playSound(soundElement) {
    if (isSoundOn) {
        // Reset the sound to start from beginning
        soundElement.currentTime = 0;
        soundElement.volume = volumeSlider.value;
        soundElement.play().catch(error => {
            console.log('Error playing sound effect:', error);
        });
    }
}

// Handle sound control click
soundControl.addEventListener('click', toggleSound);

// Handle volume change
volumeSlider.addEventListener('input', updateVolume);

// Initialize volume from saved preference
if (localStorage.getItem('cozyGardenVolume') !== null) {
    const savedVolume = localStorage.getItem('cozyGardenVolume');
    volumeSlider.value = savedVolume;
    backgroundSound.volume = savedVolume;
}

// Initialize sound state from saved preference
if (localStorage.getItem('cozyGardenSoundOn') !== null) {
    const savedSoundState = localStorage.getItem('cozyGardenSoundOn');
    isSoundOn = savedSoundState === 'true';

    // Update UI to match saved state
    soundControl.textContent = isSoundOn ? '🔊' : '🔇';
}


// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    createEmojiStyles();
    initGame();

    // Debug function to log tab info
    function debugTabs() {
        console.log('Main tab buttons:', document.querySelectorAll('.main-tab-btn').length);
        console.log('Inventory tab:', document.querySelector('[data-main-tab="inventory"]'));
        console.log('Shop tab:', document.querySelector('[data-main-tab="shop"]'));
    }

    // Run debug
    setTimeout(debugTabs, 1000);

    // Force test the inventory tab after a delay
    setTimeout(() => {
        console.log('Forcing inventory tab');
        switchMainTab('inventory');
        // Update the button state manually
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mainTab === 'inventory');
        });
    }, 2000);

    // Prevent game container interactions until splash screen is dismissed
    document.querySelector('.game-container').style.pointerEvents = 'none';
});
