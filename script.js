// Game constants
const INITIAL_MONEY = 100;
const INITIAL_UNLOCKED_CROPS = ["carrot", "potato", "tomato"]; // Start with just these basic crops

// Animal Friends
const ANIMAL_FRIENDS = [
    {
        name: "Bunny",
        emoji: "🐰",
        preferredCrops: ["carrot", "potato"],
        giftLevel: 5, // How many gifts to fill the meter
        difficulty: 1, // Easy
        reward: {
            type: "items",
            item: "carrot",
            amount: 3
        }
    },
    {
        name: "Squirrel",
        emoji: "🐿️",
        preferredCrops: ["corn", "pumpkin"],
        giftLevel: 8,
        difficulty: 2, // Medium
        reward: {
            type: "items",
            item: "corn",
            amount: 4
        }
    },
    {
        name: "Hedgehog",
        emoji: "🦔",
        preferredCrops: ["tomato", "eggplant"],
        giftLevel: 10,
        difficulty: 3, // Medium-Hard
        reward: {
            type: "items",
            item: "tomato",
            amount: 5
        }
    },
    {
        name: "Fox",
        emoji: "🦊",
        preferredCrops: ["tulip", "sunflower"],
        giftLevel: 12,
        difficulty: 4, // Hard
        reward: {
            type: "money",
            amount: 50
        }
    },
    {
        name: "Owl",
        emoji: "🦉",
        preferredCrops: ["goldenRose"],
        giftLevel: 5,
        difficulty: 5, // Very Hard
        reward: {
            type: "special",
            item: "goldenRose",
            amount: 1
        }
    }
];

// Random animal emojis for splash screen
const ANIMAL_EMOJIS = ["🐰", "🐿️", "🦔", "🦊", "🦉", "🐢", "🦝", "🐻", "🐼", "🐨", "🦁", "🐯", "🦊", "🐱", "🐶"];

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
    unlockedSeeds: [...INITIAL_UNLOCKED_CROPS], // Array of seed names that are unlocked
    friends: [], // Animal friends data
    dailyGiftedFriends: [], // Track which friends received gifts today
    hiddenShopItems: [] // Track which shop items have been hidden after purchase
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
const selectedSeedEmoji = document.querySelector('.selected-seed-emoji');
const selectedSeedName = document.querySelector('.selected-seed-name');

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
        // Always show the continue button, but disable it if no saved data
        continueGameButton.style.display = 'inline-block';
        continueGameButton.textContent = 'No Saved Game';
        continueGameButton.disabled = true;
        continueGameButton.style.backgroundColor = '#9e9e9e';
        continueGameButton.style.cursor = 'not-allowed';
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
    updateFriendsUI();
    hideSplashScreen();

    // Add handler for friends tab if not already added
    const friendsTabBtn = document.querySelector('[data-main-tab="friends"]');
    if (friendsTabBtn) {
        friendsTabBtn.addEventListener('click', () => switchMainTab('friends'));
    }

    // Start animal message system
    startAnimalMessages();
}

// Start a new game
function startNewGame() {
    resetGameState();
    createPlots();
    updateUI();
    updateInventoryUI();
    updateShopUI();
    updateSeedAvailability();
    updateFriendsUI();
    hideSplashScreen();
    closeModal();
    addJournalEntry('Starting a fresh garden! The weather is perfect for planting.');
    addJournalEntry('Some animal friends have appeared! They would like gifts from your garden.');

    // Add handler for friends tab if not already added
    const friendsTabBtn = document.querySelector('[data-main-tab="friends"]');
    if (friendsTabBtn) {
        friendsTabBtn.addEventListener('click', () => switchMainTab('friends'));
    }

    // Start animal message system
    startAnimalMessages();
}

// Prompt for confirmation before starting a new game
function promptNewGame() {
    const savedData = localStorage.getItem('cozyGardenGame');

    if (savedData) {
        // Show confirmation modal
        confirmModal.classList.add('visible');
    } else {
        // No saved game, but still start a new game only when explicitly clicked
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
        unlockedSeeds: [...INITIAL_UNLOCKED_CROPS],
        friends: initializeAnimalFriends(),
        dailyGiftedFriends: [],
        hiddenShopItems: []
    };

    // Make sure all shop items are visible again
    updateShopUI();
}

// Initialize animal friends with their preferences for the day
function initializeAnimalFriends() {
    return ANIMAL_FRIENDS.map(friend => {
        return {
            ...friend,
            friendshipLevel: 0,
            dailyPreference: getRandomPreference(friend)
        };
    });
}

// Get a random preference for an animal friend from their preferred crops
function getRandomPreference(friend) {
    return friend.preferredCrops[Math.floor(Math.random() * friend.preferredCrops.length)];
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

    // Get the seed item in the shop to hide it
    const seedItem = document.querySelector(`.buy-btn[data-seed="${seedName}"]`).closest('.inventory-item');

    // After a few seconds, hide the purchased seed from the shop
    setTimeout(() => {
        if (seedItem) {
            seedItem.style.display = 'none';
            // Add to hidden items list
            gameState.hiddenShopItems.push(seedName);
            saveGame();
        }
    }, 3000); // Hide after 3 seconds
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
        // Skip seeds that have been purchased and hidden (until game reset)
        if (gameState.hiddenShopItems && gameState.hiddenShopItems.includes(seedName)) {
            continue;
        }

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

    // Update the selected seed display
    const cropData = CROPS[seedType];
    selectedSeedEmoji.textContent = cropData.stages[cropData.stages.length - 1]; // Use the grown stage emoji
    selectedSeedName.textContent = seedType.charAt(0).toUpperCase() + seedType.slice(1); // Capitalize first letter

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

    // Reset daily gifted friends and update animal friend preferences
    gameState.dailyGiftedFriends = [];
    gameState.friends.forEach(friend => {
        friend.dailyPreference = getRandomPreference(friend);
    });

    // Update UI
    dayCountDisplay.textContent = `Day ${gameState.day}`;
    updateMoney();
    updateFriendsUI();

    // Add journal entry
    addJournalEntry(`Day ${gameState.day} begins. Weather is ${gameState.weather.text}.`);
    showNotification(`Good morning! It's Day ${gameState.day}`);

    saveGame();
}

// Give a gift to an animal friend
function giftToFriend(friendIndex, cropName) {
    // Check if we have this crop in inventory
    if (!gameState.inventory[cropName] || gameState.inventory[cropName] <= 0) {
        showNotification(`You don't have any ${cropName} to give!`);
        return;
    }

    // Check if we've already gifted this friend today
    if (gameState.dailyGiftedFriends.includes(friendIndex)) {
        showNotification(`You already gave a gift to this friend today!`);
        return;
    }

    const friend = gameState.friends[friendIndex];

    // Remove the crop from inventory
    gameState.inventory[cropName]--;
    if (gameState.inventory[cropName] <= 0) {
        delete gameState.inventory[cropName];
    }

    // Mark as gifted today
    gameState.dailyGiftedFriends.push(friendIndex);

    // Increase friendship based on whether this was the preferred crop
    let friendshipIncrease = 1;
    if (cropName === friend.dailyPreference) {
        friendshipIncrease = 2; // Double points for preferred crop
        showNotification(`${friend.name} loved the ${cropName}!`);
        addJournalEntry(`${friend.name} was delighted with the ${cropName} - it's their favorite!`);
    } else if (friend.preferredCrops.includes(cropName)) {
        friendshipIncrease = 1;
        showNotification(`${friend.name} liked the ${cropName}.`);
        addJournalEntry(`${friend.name} appreciated the ${cropName}.`);
    } else {
        friendshipIncrease = 0.5; // Half point for non-preferred crop
        showNotification(`${friend.name} accepted the ${cropName}.`);
        addJournalEntry(`${friend.name} took the ${cropName}, but didn't seem very excited.`);
    }

    // Update friendship level
    friend.friendshipLevel += friendshipIncrease;

    // Check if friendship level is maxed
    if (friend.friendshipLevel >= friend.giftLevel && !friend.rewardClaimed) {
        // Give reward
        giveAnimalReward(friendIndex);
        friend.rewardClaimed = true;
    }

    // Update UI
    updateFriendsUI();
    updateInventoryUI();

    // Save game
    saveGame();
}

// Give reward when friendship level is maxed
function giveAnimalReward(friendIndex) {
    const friend = gameState.friends[friendIndex];
    const reward = friend.reward;

    let rewardText = '';

    if (reward.type === 'items') {
        // Add items to inventory
        for (let i = 0; i < reward.amount; i++) {
            addToInventory(reward.item);
        }
        rewardText = `${reward.amount} ${reward.item}${reward.amount > 1 ? 's' : ''}`;
    } else if (reward.type === 'money') {
        // Add money
        gameState.money += reward.amount;
        updateMoney();
        rewardText = `${reward.amount} coins`;
    } else if (reward.type === 'special') {
        // Add special item
        for (let i = 0; i < reward.amount; i++) {
            addToInventory(reward.item);
        }
        rewardText = `a rare ${reward.item}`;
    }

    showNotification(`${friend.name} gave you ${rewardText}!`);
    addJournalEntry(`${friend.name} has become your good friend and gave you ${rewardText} as a thank you gift!`);

    // Reset friendship for continued gifts
    friend.friendshipLevel = 0;
    friend.rewardClaimed = false;
}

// Update the animal friends UI
function updateFriendsUI() {
    const friendsContainer = document.getElementById('friends-container');
    if (!friendsContainer) return;

    friendsContainer.innerHTML = '';

    // Sort friends by difficulty (easiest first)
    const sortedFriends = [...gameState.friends].sort((a, b) => a.difficulty - b.difficulty);

    sortedFriends.forEach((friend, index) => {
        const realIndex = gameState.friends.findIndex(f => f.name === friend.name);
        const friendElement = document.createElement('div');
        friendElement.className = 'friend-item';

        // Check if this friend has been gifted today
        const isGiftedToday = gameState.dailyGiftedFriends.includes(realIndex);
        if (isGiftedToday) {
            friendElement.classList.add('gifted-today');
        }

        // Create friendship meter
        const meterPercentage = (friend.friendshipLevel / friend.giftLevel) * 100;

        friendElement.innerHTML = `
            <div class="friend-info">
                <span class="friend-emoji">${friend.emoji}</span>
                <div class="friend-details">
                    <span class="friend-name">${friend.name}</span>
                    <span class="friend-wants">Wants: ${CROPS[friend.dailyPreference].stages[2]}</span>
                </div>
            </div>
            <div class="friend-meter-container">
                <div class="friend-meter" style="width: ${meterPercentage}%"></div>
            </div>
        `;

        // Add gift button
        const giftButton = document.createElement('button');
        giftButton.className = 'gift-btn';
        giftButton.textContent = 'Gift';
        giftButton.disabled = isGiftedToday;

        if (!isGiftedToday) {
            giftButton.addEventListener('click', () => {
                openGiftModal(realIndex);
            });
        }

        friendElement.appendChild(giftButton);
        friendsContainer.appendChild(friendElement);
    });
}

// Open modal for selecting a gift
function openGiftModal(friendIndex) {
    // Get existing modal or create new one
    let giftModal = document.getElementById('gift-modal');
    if (!giftModal) {
        giftModal = document.createElement('div');
        giftModal.id = 'gift-modal';
        giftModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        giftModal.appendChild(modalContent);
        document.body.appendChild(giftModal);
    }

    const modalContent = giftModal.querySelector('.modal-content');
    const friend = gameState.friends[friendIndex];

    modalContent.innerHTML = `
        <h2>Gift to ${friend.name}</h2>
        <p>Select an item to give:</p>
        <div class="gift-grid" id="gift-grid"></div>
        <button class="cancel-btn" id="cancel-gift-btn">Cancel</button>
    `;

    // Add inventory items to the gift grid
    const giftGrid = modalContent.querySelector('#gift-grid');

    // Check if inventory is empty
    if (Object.keys(gameState.inventory).length === 0) {
        giftGrid.innerHTML = '<p class="empty-inventory-message">You have no items to gift.</p>';
    } else {
        for (const [cropName, count] of Object.entries(gameState.inventory)) {
            const cropData = CROPS[cropName];
            const isPreferred = friend.dailyPreference === cropName;

            const item = document.createElement('div');
            item.className = 'gift-item';
            if (isPreferred) {
                item.classList.add('preferred');
            }

            // Get the grown stage emoji
            const cropEmoji = cropData.stages[cropData.stages.length - 1];

            item.innerHTML = `
                <span class="crop-emoji">${cropEmoji}</span>
                <span class="crop-name">${cropName}</span>
                <span class="crop-count">${count}</span>
                ${isPreferred ? '<span class="preferred-tag">Favorite!</span>' : ''}
            `;

            item.addEventListener('click', () => {
                giftToFriend(friendIndex, cropName);
                closeGiftModal();
            });

            giftGrid.appendChild(item);
        }
    }

    // Set up cancel button
    const cancelButton = modalContent.querySelector('#cancel-gift-btn');
    cancelButton.addEventListener('click', closeGiftModal);

    // Show the modal
    giftModal.classList.add('visible');
}

// Close the gift modal
function closeGiftModal() {
    const giftModal = document.getElementById('gift-modal');
    if (giftModal) {
        giftModal.classList.remove('visible');
    }
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

// Track previous money amount to detect increases
let previousMoney = INITIAL_MONEY;

// Update money display
function updateMoney() {
    // Check if money has increased
    if (gameState.money > previousMoney) {
        // Create sparkle effect
        createMoneySparkles();
    }

    // Update display
    coinsDisplay.textContent = gameState.money;

    // Update previous money value
    previousMoney = gameState.money;
}

// Create sparkle effects around the money counter
function createMoneySparkles() {
    const coinsElement = document.querySelector('.coins');
    const sparkleSymbols = ['✨', '⭐', '💫', '🌟'];

    // Create 4-6 sparkles
    const sparkleCount = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < sparkleCount; i++) {
        // Create sparkle element
        const sparkle = document.createElement('div');
        sparkle.className = 'money-sparkle';

        // Random sparkle symbol
        sparkle.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];

        // Random position around the money counter
        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = 30 + Math.random() * 20; // Random distance from center
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        // Position sparkle
        sparkle.style.left = `calc(50% + ${offsetX}px)`;
        sparkle.style.top = `calc(50% + ${offsetY}px)`;

        // Add to DOM
        coinsElement.appendChild(sparkle);

        // Remove sparkle after animation completes
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 600); // Match animation duration
    }
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

    // Update the selected seed display
    const cropData = CROPS[gameState.selectedSeed];
    selectedSeedEmoji.textContent = cropData.stages[cropData.stages.length - 1];
    selectedSeedName.textContent = gameState.selectedSeed.charAt(0).toUpperCase() + gameState.selectedSeed.slice(1);
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
        gameState.hiddenShopItems = loadedData.hiddenShopItems || [];

        // Restore animal friends or initialize them if they don't exist
        if (loadedData.friends && loadedData.friends.length > 0) {
            gameState.friends = loadedData.friends;
            gameState.dailyGiftedFriends = loadedData.dailyGiftedFriends || [];
        } else {
            gameState.friends = initializeAnimalFriends();
            gameState.dailyGiftedFriends = [];
        }

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

// Animal message system
let animalMessageTimer = null;

// Generate a random animal message based on message type
function generateAnimalMessage(animal, messageType) {
    const messages = {
        weather: [
            `It's a ${gameState.weather.text.toLowerCase()} day!`,
            `The ${gameState.weather.text.toLowerCase()} weather makes me feel ${gameState.weather.growthBonus > 1 ? 'energetic' : 'sleepy'}.`,
            `I love ${gameState.weather.text.toLowerCase()} days like this!`,
            `Weather like this makes me want to ${gameState.weather.growthBonus > 1 ? 'play outside' : 'stay cozy inside'}.`
        ],
        needs: [
            `I wish I had a ${animal.dailyPreference}...`,
            `I'm dreaming about eating ${animal.dailyPreference} today.`,
            `Do you think you could grow some ${animal.dailyPreference} for me?`,
            `Nothing would make me happier than a fresh ${animal.dailyPreference}!`
        ],
        friendly: [
            `Hope you're having a great day!`,
            `Your garden is looking lovely today!`,
            `It's so peaceful here in your garden.`,
            `I'm so happy to be your friend!`,
            `Thanks for taking care of this place!`
        ]
    };

    // Select a random message from the appropriate category
    const selectedMessages = messages[messageType];
    return selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
}

// Add an animal message to the journal
function addAnimalMessage() {
    // Only proceed if we have animal friends
    if (!gameState.friends || gameState.friends.length === 0) return;

    // Pick a random animal
    const randomAnimalIndex = Math.floor(Math.random() * gameState.friends.length);
    const animal = gameState.friends[randomAnimalIndex];

    // Pick a random message type (weather, needs, or friendly)
    const messageTypes = ['weather', 'needs', 'friendly'];
    const randomMessageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];

    // Generate the message
    const message = generateAnimalMessage(animal, randomMessageType);

    // Add formatted message to journal with animal emoji
    const entry = document.createElement('p');
    entry.innerHTML = `Day ${gameState.day}: <span class="animal-message">${animal.emoji} <strong>${animal.name}:</strong> ${message}</span>`;
    journalEntries.prepend(entry);

    // Keep only the last 10 entries
    while (journalEntries.children.length > 10) {
        journalEntries.removeChild(journalEntries.lastChild);
    }

    // Schedule the next animal message
    scheduleNextAnimalMessage();
}

// Schedule the next animal message at a random interval
function scheduleNextAnimalMessage() {
    // Clear any existing timer
    if (animalMessageTimer) {
        clearTimeout(animalMessageTimer);
    }

    // Random interval between 15-45 seconds
    const randomInterval = 15000 + Math.floor(Math.random() * 30000);

    // Set the timer for the next message
    animalMessageTimer = setTimeout(addAnimalMessage, randomInterval);
}

// Start animal message system
function startAnimalMessages() {
    // Schedule the first message
    scheduleNextAnimalMessage();
}


// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    createEmojiStyles();
    initGame();

    // Add random animal emoji to splash screen
    const splashContentP = document.querySelector('.splash-content p');
    const randomAnimalEmoji = ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)];
    splashContentP.innerHTML = `Relax and grow your garden <span class="splash-animal">${randomAnimalEmoji}</span>`;

    // Make sure splash screen is visible
    splashScreen.style.display = 'flex';
    splashScreen.style.opacity = '1';

    // Update Friends UI if tab exists
    const friendsContainer = document.getElementById('friends-container');
    if (friendsContainer) {
        updateFriendsUI();
    }

    // Debug function to log tab info
    function debugTabs() {
        console.log('Main tab buttons:', document.querySelectorAll('.main-tab-btn').length);
        console.log('Inventory tab:', document.querySelector('[data-main-tab="inventory"]'));
        console.log('Shop tab:', document.querySelector('[data-main-tab="shop"]'));
    }

    // Run debug
    setTimeout(debugTabs, 1000);

    // We don't need to force the inventory tab anymore
    // as it was causing issues with the splash screen

    // Prevent game container interactions until splash screen is dismissed
    document.querySelector('.game-container').style.pointerEvents = 'none';
});
