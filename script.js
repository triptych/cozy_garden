// Game constants
const CROPS = {
    carrot: {
        growthTime: 5000, // milliseconds (for demo purposes, would be longer in a real game)
        cost: 10,
        profit: 25,
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
        stages: [
            '🌱', // seed
            '🌿', // growing
            '🎃'  // grown
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
    money: 100,
    selectedSeed: 'carrot',
    day: 1,
    weather: WEATHER_TYPES[0],
    plots: []
};

// DOM elements
const farmGrid = document.getElementById('farm-grid');
const coinsDisplay = document.getElementById('coins');
const seedElements = document.querySelectorAll('.seed');
const nextDayButton = document.getElementById('next-day');
const dayCountDisplay = document.getElementById('day-count');
const weatherIcon = document.getElementById('weather-icon');
const weatherText = document.getElementById('weather-text');
const journalEntries = document.getElementById('journal-entries');
const notification = document.getElementById('notification');
const splashScreen = document.getElementById('splash-screen');
const startGameButton = document.getElementById('start-game');
const backgroundSound = document.getElementById('background-sound');
const soundControl = document.getElementById('sound-control');

// Initialize game
function initGame() {
    createPlots();
    loadGame();
    updateUI();
    seedElements.forEach(seed => {
        seed.addEventListener('click', () => selectSeed(seed.dataset.seed));
    });
    nextDayButton.addEventListener('click', startNextDay);
}

// Create farm plots
function createPlots() {
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
            // Increase growth based on weather bonus
            plot.growthProgress += 100 * gameState.weather.growthBonus;

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

                addJournalEntry(`Your ${plot.crop} is ready for harvest!`);
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

// Harvest a crop
function harvestCrop(plotIndex, plotElement) {
    const plot = gameState.plots[plotIndex];
    const cropData = CROPS[plot.crop];

    // Add profit
    gameState.money += cropData.profit;
    updateMoney();

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
    addJournalEntry(`Harvested ${plot.crop} for ${cropData.profit} coins.`);
    showNotification(`Harvested ${plot.crop} +${cropData.profit} coins!`);

    // Save game
    saveGame();
}

// Select a seed type
function selectSeed(seedType) {
    gameState.selectedSeed = seedType;

    // Update UI
    seedElements.forEach(seed => {
        if (seed.dataset.seed === seedType) {
            seed.classList.add('selected');
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

    // Passive money bonus each day
    const dailyBonus = 5;
    gameState.money += dailyBonus;

    // Update UI
    dayCountDisplay.textContent = `Day ${gameState.day}`;
    updateMoney();

    // Add journal entry
    addJournalEntry(`Day ${gameState.day} begins. Weather is ${gameState.weather.text}.`);
    showNotification(`Good morning! It's Day ${gameState.day}`);

    saveGame();
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

function toggleSound() {
    if (isSoundOn) {
        backgroundSound.pause();
        soundControl.textContent = '🔇';
    } else {
        backgroundSound.play();
        soundControl.textContent = '🔊';
    }
    isSoundOn = !isSoundOn;
}

// Handle sound control click
soundControl.addEventListener('click', toggleSound);

// Start game from splash screen
function startGame() {
    // Play background sound
    backgroundSound.play().catch(error => {
        console.log('Audio autoplay was prevented, click sound control to start audio');
    });

    // Hide splash screen with fade effect
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 500);

    // Add journal entry
    addJournalEntry('Welcome to your garden! The weather is perfect for planting.');
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    createEmojiStyles();
    initGame();

    // Set up splash screen button
    startGameButton.addEventListener('click', startGame);

    // Prevent game container interactions until splash screen is dismissed
    document.querySelector('.game-container').style.pointerEvents = 'none';
    startGameButton.addEventListener('click', () => {
        document.querySelector('.game-container').style.pointerEvents = 'auto';
    });
});
