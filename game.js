const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1f84e5',
    scene: {
        preload: preload,
        create: create
    }
};

// Global variables
let game = new Phaser.Game(config);
let currentLevel = 1;
let cardsToMemorize = 4; // Start with 4 cards
let score = 0;
let mistakes = 0;
let maxMistakes = 5;
let timeToMemorize = 10; // seconds
let timeToFind = 30; // seconds
let memoryTimer;
let findingTimer;
let memoryTimerText;
let findingTimerText;
let scoreText;
let mistakesText;
let levelText;
let allCards = [];
let selectedCards = [];
let foundCards = 0;
let gameState = 'start'; // 'start', 'memorize', 'find', 'gameOver'

function preload() {
    this.load.setBaseURL('assets/images/');
    
    // Load background image
    this.load.image('background', 'bg.jpg');
    //this.load.image('background_Start', 'bg.jpg');
    //this.load.image('background_GameOver', 'bg.jpg');
    //this.load.image('background_Win', 'bg.jpg');	
    this.load.image('background_Start', 'bgStart.jpg');
    this.load.image('background_GameOver', 'bgGameOver.jpg');
    this.load.image('background_Win', 'bgWin.jpg');
    this.load.image('copy', 'Copy.png');
    
    // Load all 32 card images
    for (let i = 1; i <= 32; i++) {
        this.load.image('card' + i, i + '.png');
    }
}

function create() {
    this.scale.resize(window.innerWidth, window.innerHeight);
    
    // Create start screen
    createStartScreen.call(this);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        this.scale.resize(window.innerWidth, window.innerHeight);
        if (gameState === 'start') {
            createStartScreen.call(this);
        }
    });
}

function createStartScreen() {
    // Clear any existing elements
    this.children.removeAll(true);

    const width = this.scale.width;
    const height = this.scale.height;

    // Add background image with fixed size instead of scaling to screen
    const background = this.add.image(width/2, height/2, 'background_Start').setDisplaySize((config.height*3500)/2500, config.height);
    // Keep original size instead of scaling
    
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 3;
    
    // Title - increased size and added shadow
    const title = this.add.text(centerX, centerY - 100, 'Benvenuto \n in Zoro Sequence', {
        fontFamily: 'Arial',
        fontSize: '60px', // Increased from 80px to 120px
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: {
            offsetX: 5,
            offsetY: 5,
            color: '#000000',
            blur: 10,
            stroke: true,
            fill: true
        }
    }).setOrigin(0.5);
    
    // Start button - removed backgroundColor
    const startButton = this.add.text(centerX, centerY + 50, 'START', {
        fontFamily: 'Arial',
        fontSize: '50px',
        fontStyle: 'bold',
        color: '#ffffff',
        padding: {
            x: 50,
            y: 20
        },
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setInteractive();

// Game instructions text
const instructionsText = this.add.text(config.width / 2, config.height / 2 - 20, 
    'Memorizza attentamente la sequenza di carte raffiguranti Zoro: avrai solo 10 secondi per osservare le carte scelte casualmente tra 32 disponibili. Il tuo obiettivo? Selezionare esattamente le carte viste in precedenza. Hai fino a 3 errori a disposizione... riesci a ricordarle tutte? Buona fortuna!', {
        fontFamily: 'Arial',
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
    align: 'center',
    wordWrap: { width: config.width * 0.8 }
}).setOrigin(0.5).setShadow(2, 2, '#000000', 2, false, true);

instructionsText.setText('');
const fullText = 'Memorizza attentamente la sequenza di carte raffiguranti Zoro: avrai solo 10 secondi per osservare le carte scelte casualmente tra 32 disponibili. Il tuo obiettivo? Selezionare esattamente le carte viste in precedenza. Hai fino a 3 errori a disposizione... riesci a ricordarle tutte? Buona fortuna!';
let i = 0;

this.time.addEvent({
    delay: 30,
    repeat: fullText.length - 1,
    callback: () => {
        instructionsText.text += fullText[i];
        i++;
    }
});

const copyImage = this.add.image(config.width -180, config.height - 25, 'copy')
.setOrigin(0.5)
.setScale(0.35); // Adjust scale as needed for your image

//const Copyright = this.add.text(config.width / 2, config.height -50 , '(C) Eiichiro Oda/Shueisha, Toei Animation', {
//    fontFamily: '"Comic Neue", cursive',
//    fontSize: '15px', // Increased from 80px to 120px
//    color: '#ffffff',
//    stroke: '#000000',
//    strokeThickness: 3
//}).setOrigin(0.5);
    
    // Remove hover effect that changes background color
    startButton.on('pointerover', () => {
        startButton.setStyle({ fontSize: '55px' }); // Just increase font size instead
    });
    
    startButton.on('pointerout', () => {
        startButton.setStyle({ fontSize: '50px' }); // Restore original font size
    });
    
    // Start game on click
    startButton.on('pointerdown', () => {
        gameState = 'memorize';
        startLevel.call(this);
    });
}

function startLevel() {
    // Clear any existing elements
    this.children.removeAll(true);

    //background = this.add.image(425, 425, 'background');
    //background.setDisplaySize(850, 850);
	
	background = this.add.image(this.scale.width/2, this.scale.height/2, 'background');
    
    // Reset for new level
    foundCards = 0;
    selectedCards = [];
    allCards = [];
    
    // Set number of cards to memorize based on level
    //cardsToMemorize = currentLevel === 1 ? 4 : 8; - Giovanni
    cardsToMemorize = currentLevel === 1 ? 4 : currentLevel === 2 ? 6 : 8;
    

    // Create UI elements
    createUI.call(this);
    
    // Create memorize phase
    createMemorizePhase.call(this);
}

function createUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Top bar background
    this.add.rectangle(width/2, 40, width, 100, 0x16213e).setOrigin(0.5, 0.5).setAlpha(0.5);
    
    // Level text
    levelText = this.add.text(20, 20, 'Livello: ' + currentLevel, {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff'
    });
    
    // Score text
    scoreText = this.add.text(width - 20, 20, 'Punteggio: ' + score, {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff'
    }).setOrigin(1, 0);
    
    // Mistakes text
    mistakesText = this.add.text(width/2, 20, 'Errori: ' + mistakes + '/' + maxMistakes, {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff'
    }).setOrigin(0.5, 0);
    
    // Timer text (will be updated based on game state)
    if (gameState === 'memorize') {
        memoryTimerText = this.add.text(width/2, 60, 'Tempo: ' + timeToMemorize + 's', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0);
    } else if (gameState === 'find') {
        findingTimerText = this.add.text(width/2, 60, 'Tempo: ' + timeToFind + 's', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0);
    }
}

function createMemorizePhase() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Instructions text
    const instructionsText = this.add.text(width/2, 120, 'Memorizza la seguente sequenza di carte!', {
        fontFamily: 'Arial',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5, 0);
    
    // Select random cards to memorize
    const cardIndices = [];
    while (cardIndices.length < cardsToMemorize) {
        const randomIndex = Phaser.Math.Between(1, 32);
        if (!cardIndices.includes(randomIndex)) {
            cardIndices.push(randomIndex);
        }
    }
    
    selectedCards = cardIndices;
    
    // Calculate card dimensions and positions
    //const gridSize = cardsToMemorize === 4 ? 2 : 4; // 2x2 for level 1, 2x4 for level 2
    let gridSize;

    switch (cardsToMemorize) {
        case 4:
            gridSize = 2;
            break;
        case 6:
            gridSize = 3;
            break;
        case 8:
            gridSize = 4;
            break;
        default:
            gridSize = 4; // fallback
    }

    const cardWidth =142// Math.min(width * 0.8 / gridSize, 150);
    const cardHeight =250// cardWidth * 1.4;
    const spacing = 15; // Add 15px spacing between cards
    
    // Adjust startX and startY to account for spacing
    const totalWidth = (cardWidth * gridSize) + (spacing * (gridSize - 1));
    const totalHeight = cardsToMemorize === 4 ? 
                        (cardHeight * 2) + spacing : 
                        (cardHeight * 2) + spacing;
    
    const startX = width/2 - (totalWidth/2) + (cardWidth/2);
    const startY = height/2 - (totalHeight/2) + (cardHeight/2);
    
    // Create cards to memorize
    for (let i = 0; i < cardsToMemorize; i++) {
        const col = i % gridSize;
        const row = Math.floor(i / gridSize);
        
        // Apply spacing to card positions
        const x = startX + col * (cardWidth + spacing);
        const y = startY + row * (cardHeight + spacing);
        
        //const shadow = this.add.rectangle(x + 5, y + 5, cardWidth, cardHeight, 0x000000, 0.1);


        const card = this.add.image(x, y, 'card' + cardIndices[i])
            .setDisplaySize(cardWidth, cardHeight);
    }
    
    // Start memorize timer - FIXED IMPLEMENTATION
    let timeLeft = timeToMemorize;
    memoryTimerText.setText('Tempo: ' + timeLeft + 's');
    
    if (memoryTimer) memoryTimer.remove();
    
    memoryTimer = this.time.addEvent({
        delay: 1000,
        callback: () => {
            timeLeft--;
            memoryTimerText.setText('Tempo: ' + timeLeft + 's');
            
            if (timeLeft <= 0) {
                memoryTimer.remove();
                // Move to finding phase
                gameState = 'find';
                createFindingPhase.call(this);
            }
        },
        callbackScope: this,
        repeat: timeToMemorize - 1
    });
}

// Add this new global variable near the other global variables
let initialCardSetup = false;
let fixedCardIndices = [];

function createFindingPhase() {
    // Clear previous elements
    this.children.removeAll(true);
    
    //background = this.add.image(425, 425, 'background');
    //background.setDisplaySize(850, 850);
	background = this.add.image(this.scale.width/2, this.scale.height/2, 'background');
    // Recreate UI
    createUI.call(this);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Instructions text
    const instructionsText = this.add.text(width/2, 120, 'Cerca le carte!', {
        fontFamily: 'Arial',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5, 0);
    
    // Create all 32 cards (including the ones to find)
    let allIndices = [];
    
    // Only shuffle the cards on the first level or if not yet initialized
    if (!initialCardSetup) {
        for (let i = 1; i <= 32; i++) {
            allIndices.push(i);
        }
        // Shuffle the indices only the first time
        Phaser.Utils.Array.Shuffle(allIndices);
        fixedCardIndices = [...allIndices]; // Save the shuffled order
        initialCardSetup = true;
    } else {
        // Use the same card order as before
        allIndices = [...fixedCardIndices];
    }
    
    // Calculate card dimensions and positions
    const cols = 8;
    const rows = 4;
    //const cardWidth = Math.min(width * 0.9 / cols, 100);
    //const cardHeight = cardWidth * 1.4;
    //const spacing = 5; // Add 15px spacing between cards

    const cardWidth =142/2// Math.min(width * 0.8 / gridSize, 150);
    const cardHeight =250/2// cardWidth * 1.4;
    const spacing = 5; // Add 15px spacing between cards
    
    // Adjust startX and startY to account for spacing
    const totalWidth = (cardWidth * cols) + (spacing * (cols - 1));
    const totalHeight = (cardHeight * rows) + (spacing * (rows - 1));
    
    const startX = width/2 - (totalWidth/2) + (cardWidth/2);
    const startY = 180 + (cardHeight/2);
    
    // Create all cards
    for (let i = 0; i < 32; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        // Apply spacing to card positions
        const x = startX + col * (cardWidth + spacing);
        const y = startY + row * (cardHeight + spacing);

        //const shadow = this.add.rectangle(x + 3, y + 3, cardWidth, cardHeight, 0x000000, 0.3);
        
        const cardIndex = allIndices[i];
        const card = this.add.image(x, y, 'card' + cardIndex)
            .setDisplaySize(cardWidth, cardHeight)
            .setInteractive();
        
        // Store card data
        card.cardIndex = cardIndex;
        allCards.push(card);
        
        // Add click handler
        card.on('pointerdown', () => {
            handleCardClick.call(this, card);
        });
    }
    
    // Start finding timer - FIXED IMPLEMENTATION
    let timeLeft = timeToFind;
    findingTimerText.setText('Tempo: ' + timeLeft + 's');
    
    if (findingTimer) findingTimer.remove();
    
    findingTimer = this.time.addEvent({
        delay: 1000,
        callback: () => {
            timeLeft--;
            findingTimerText.setText('Tempo: ' + timeLeft + 's');
            
            if (timeLeft <= 0) {
                findingTimer.remove();
                // Game over - time's up
                gameOver.call(this, false);
            }
        },
        callbackScope: this,
        repeat: timeToFind - 1
    });
}

function handleCardClick(card) {
    // Ignore if card is already found or disabled
    if (card.found || card.disabled) {
        return;
    }
    
    // Check if the card is one of the ones to find
    if (selectedCards.includes(card.cardIndex)) {
        // Correct card found
        card.found = true;
        //card.setTint(0x00ff00); // Green tint
        const border = this.add.graphics();
        border.lineStyle(2, 0x00ff00); // Spessore 4px, colore rosso
        border.strokeRect(
            card.x - card.displayWidth / 2,
            card.y - card.displayHeight / 2,
            card.displayWidth,
            card.displayHeight
        );

        foundCards++;
        score += 10;
        scoreText.setText('Punteggio: ' + score);
        
        
        
        // Check if all cards are found
        if (foundCards === cardsToMemorize) {
            // Level complete
            findingTimer.remove();
            this.time.delayedCall(1000, () => {
                currentLevel++;
                gameState = 'memorize';
                startLevel.call(this);
            });
        }
    } else {
        // Wrong card
        card.disabled = true;
        //card.setTint(0xff0000); // Red tint
        //Giovanni
        const border = this.add.graphics();
        border.lineStyle(2, 0xff0000); // Spessore 4px, colore rosso
        border.strokeRect(
            card.x - card.displayWidth / 2,
            card.y - card.displayHeight / 2,
            card.displayWidth,
            card.displayHeight
        );

        // Disable the card temporarily
        this.time.delayedCall(500, () => {
            card.clearTint();
        });
        
        mistakes++;
        mistakesText.setText('Errori: ' + mistakes + '/' + maxMistakes);
        
        // Check if max mistakes reached
        if (mistakes >= maxMistakes) {
            // Game over - too many mistakes
            gameOver.call(this, false);
        }
    }
}

function gameOver(success) {
    // Stop timers
    if (memoryTimer) memoryTimer.remove();
    if (findingTimer) findingTimer.remove();
    
    // Clear screen
    this.children.removeAll(true);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bgKey = currentLevel < 3 ? 'background_GameOver' : 'background_Win';
    const textGameOver =  currentLevel < 3 ? 'Game Over' : 'Hai Vinto!';

    // Aggiungi l'immagine e imposta l'origine in alto a sinistra
    //const background = this.add.image(0, 0, bgKey).setOrigin(0);
    // Ridimensiona l'immagine per occupare tutto lo schermo
    //background.setDisplaySize(width, height);   

    const background = this.add.image(width/2, height/2, bgKey).setDisplaySize((config.height*3500)/2500, config.height);

    //background = this.add.image(425, 425, bgKey);
    //background.setDisplaySize(850, 850);
    
   
    // Game over message
    this.add.text(width/2, height/2 - 100, textGameOver, {
        fontFamily: 'Arial',
        fontSize: '60px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5);
    
    // Final score
    this.add.text(width/2, height/2, 'Punteggio totale: ' + score, {
        fontFamily: 'Arial',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);
    
    // Play again button
    const playAgainButton = this.add.text(width/2, height/2 + 100, 'Nuova partita', {
        fontFamily: 'Arial',
        fontSize: '50px',
        fontStyle: 'bold',
        color: '#ffffff',
        padding: {
            x: 50,
            y: 20
        },
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setInteractive();

    
    // Add hover effect
    playAgainButton.on('pointerover', () => {
        playAgainButton.setStyle({ fontSize: '55px' }); // Just increase font size instead
    });
    
    playAgainButton.on('pointerout', () => {
        playAgainButton.setStyle({ fontSize: '50px' }); // Restore original font size
    });

    
    // Reset game on click
    playAgainButton.on('pointerdown', () => {
        // Reset game variables
        currentLevel = 1;
        score = 0;
        mistakes = 0;
        gameState = 'start';
        
        // Go back to start screen
        createStartScreen.call(this);
    });
}

// Handle device orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    }, 100);
});