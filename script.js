document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.game-board');

    // Emoji icons for the cards
    const cardIcons = ['🚀', '👽', '🤖', '⚡', '🌈', '🔥', '💎', '⭐'];
    const cards = [...cardIcons, ...cardIcons]; // Duplicate for pairs

    let hasSelectedFirstHidden = false; // Tracks if the first hidden card for a match attempt is selected
    let lockBoard = false;
    let firstHiddenCard, secondHiddenCard; // Stores the two cards selected to check for a match

    // Game statistics variables
    let pairsFound = 0;
    let guessesCount = 0;
    let timerCount = 0;
    let timerInterval;
    const totalPairs = cardIcons.length; // 8 pairs

    // DOM elements for stats display
    const pairsCountElement = document.getElementById('pairs-count');
    const guessesCountElement = document.getElementById('guesses-count');
    const timerCountElement = document.getElementById('timer-count');

    // --- Core Game Functions ---

    // Start the game timer
    function startTimer() {
        timerInterval = setInterval(() => {
            timerCount++;
            timerCountElement.textContent = timerCount;
        }, 1000);
    }

    // Shuffle the cards array
    function shuffleCards() {
        cards.sort(() => Math.random() - 0.5);
    }

    // Create the game board and cards
    function createBoard() {
        shuffleCards();
        cards.forEach(icon => {
            const card = document.createElement('div');
            card.classList.add('card','hidden');
            card.dataset.icon = icon;
            // Initially, cards are NOT 'hidden', so the front face (icon) is visible.

            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-face-front');
            frontFace.textContent = icon;

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-face-back');

            card.appendChild(frontFace);
            card.appendChild(backFace);

            card.addEventListener('click', handleCardClick);
            gameBoard.appendChild(card);
        });
        startTimer(); // Start the timer when the board is created
    }

    // Handle card clicks based on its current state (revealed or hidden)
    function handleCardClick() {
        if (lockBoard) return;
        if (this.classList.contains('match')) return; // Already matched cards are inactive

        if (!this.classList.contains('hidden')) {
            // Card is currently revealed (icon showing) -> Player wants to hide it
            this.classList.add('hidden'); // Flips to show the blank back face
            return; // No match logic needed yet, just hiding the card
        }

        // --- From here, the card is 'hidden' (blank face showing) ---
        // Player wants to reveal it to attempt a match

        if (this === firstHiddenCard) return; // Prevent double clicking the same card

        // Reveal the card (flip it to show icon)
        this.classList.remove('hidden');

        if (!hasSelectedFirstHidden) {
            // This is the first hidden card the player is trying to match
            hasSelectedFirstHidden = true;
            firstHiddenCard = this;
            return;
        }

        // This is the second hidden card the player is trying to match
        secondHiddenCard = this;
        guessesCount++;
        guessesCountElement.textContent = guessesCount;
        checkForMatch();
    }

    // Check if the two revealed cards match
    function checkForMatch() {
        let isMatch = firstHiddenCard.dataset.icon === secondHiddenCard.dataset.icon;
        isMatch ? markAsMatch() : unrevealCards();
    }

    // If cards match, mark them as matched (green border, permanently revealed)
    function markAsMatch() {
        pairsFound++;
        pairsCountElement.textContent = pairsFound;

        firstHiddenCard.classList.add('match');
        secondHiddenCard.classList.add('match');

        // Remove click listeners to "disable" matched cards
        firstHiddenCard.removeEventListener('click', handleCardClick);
        secondHiddenCard.removeEventListener('click', handleCardClick);

        resetTurn();

        if (pairsFound === totalPairs) {
            endGame();
        }
    }

    // If cards don't match, briefly highlight red then hide them again
    function unrevealCards() {
        lockBoard = true; // Lock the board to prevent more clicks

        firstHiddenCard.classList.add('wrong');
        secondHiddenCard.classList.add('wrong');

        setTimeout(() => {
            firstHiddenCard.classList.add('hidden'); // Flip back to hidden (blank)
            secondHiddenCard.classList.add('hidden'); // Flip back to hidden (blank)

            firstHiddenCard.classList.remove('wrong');
            secondHiddenCard.classList.remove('wrong');

            resetTurn();
        }, 1000); // 1-second delay for the player to see the wrong pair before they hide again
    }

    // Reset variables for the next turn
    function resetTurn() {
        [hasSelectedFirstHidden, lockBoard] = [false, false];
        [firstHiddenCard, secondHiddenCard] = [null, null];
    }

    // End the game with a confetti celebration
    function endGame() {
        clearInterval(timerInterval); // Stop the timer
        const title = document.querySelector('.title');
        title.textContent = 'You Won!';
        startConfetti();
    }

    // Use the canvas-confetti library
    function startConfetti() {
        confetti({
            particleCount: 150,
            spread: 180,
            origin: { y: 0.6 }
        });
    }

    // Start the game
    createBoard();
});