/** 
 * Sudoku Pro Engine - Latest Version 2026
 * Features: Pause System, 3 Mistakes Game Over, 3 Hint Limit
 * FIX: All functions declared before they are called.
 */

// Load the Confetti Library (Latest Stable 1.9.4)
const confettiScript = document.createElement('script');
confettiScript.src = 'https://cdn.jsdelivr.net';
document.head.appendChild(confettiScript);

// 1. GAME LOGIC FUNCTIONS (Declared first to avoid ReferenceError)

function generateSolution() {
    const board = Array(9).fill(0).map(() => Array(9).fill(0));
    solve(board);
    return board;
}

function solve(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (const num of numbers) {
                    if (isValid(board, num, r, c)) {
                        board[r][c] = num;
                        if (solve(board)) return true;
                        board[r][c] = 0; 
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(board, num, row, col) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[startRow + r][startCol + c] === num) return false;
        }
    }
    return true;
}

function createPuzzle(solution) {
    const puzzle = solution.map(row => [...row]);
    let cluesToKeep;
    switch (currentDifficulty) {
        case 'easy': cluesToKeep = 35; break;
        case 'medium': cluesToKeep = 28; break; 
        case 'hard': cluesToKeep = 22; break;
        default: cluesToKeep = 35;
    }
    let cellsRevealed = 81;
    while (cellsRevealed > cluesToKeep) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            cellsRevealed--;
        }
    }
    return puzzle;
}

// 2. GAME STATE VARIABLES

let timer;
let secondsElapsed = 0;
let hintsRemaining = 3;
let mistakes = 0;
const maxMistakes = 3;
let isPaused = false;
let currentDifficulty = 'medium'; 

let puzzle = [];
let solution = [];
let selectedCell = null;

const gridElement = document.getElementById('grid');
const bestTimeSpan = document.getElementById('best-time');


// 3. UI AND EVENT HANDLERS

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    resetGame(); 
}

function resetGame() {
    clearInterval(timer);
    secondsElapsed = 0;
    hintsRemaining = 3;
    mistakes = 0;
    isPaused = false;
    
    const overlay = document.getElementById('grid-overlay');
    if (overlay) overlay.classList.remove('active');

    // CRITICAL FIX: Ensure any existing Game Over banner is removed when starting a new game
    const gameOverBanner = document.querySelector('.game-over-banner');
    if (gameOverBanner) gameOverBanner.remove(); 
    
    if (gridElement) gridElement.innerHTML = '';
    initGame();
}

function initGame() {
    // These functions are now defined above, so the error is gone
    solution = generateSolution(); 
    puzzle = createPuzzle(solution); 
    
    const storedBest = localStorage.getItem('sudokuBestTime');
    if (storedBest) bestTimeSpan.innerText = formatTime(storedBest);

    updateStatsUI();

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if ((c + 1) % 3 === 0 && c < 8) cell.style.borderRight = "3px solid #121df1";
            if ((r + 1) % 3 === 0 && r < 8) cell.style.borderBottom = "3px solid #121df1";
            cell.dataset.row = r;
            cell.dataset.col = c;
            if (puzzle[r][c] !== 0) {
                cell.innerText = puzzle[r][c];
                cell.classList.add('fixed');
            } else {
                cell.onclick = () => {
                    if (isPaused) return;
                    if (selectedCell) selectedCell.classList.remove('selected');
                    selectedCell = cell;
                    selectedCell.classList.add('selected');
                };
            }
            gridElement.appendChild(cell);
        }
    }
    startTimer();
}

function inputNumber(num) {
    if (!selectedCell || isPaused) return;

    const r = parseInt(selectedCell.dataset.row);
    const c = parseInt(selectedCell.dataset.col);

    selectedCell.innerText = num;

    if (num !== solution[r][c]) {
        selectedCell.classList.add('error');
        mistakes++;
        updateStatsUI();
        if (mistakes >= maxMistakes) handleGameOver();
    } else {
        selectedCell.classList.remove('error');
        selectedCell.classList.remove('hinted');
        checkLineCompletion(r, c);
        checkWin();
    }
}

function clearCell() {
    if (selectedCell && !selectedCell.classList.contains('fixed') && !isPaused) {
        selectedCell.innerText = "";
        selectedCell.classList.remove('error');
        selectedCell.classList.remove('hinted');
    }
}

function getHint() {
    if (isPaused || hintsRemaining <= 0 || !selectedCell) return;
    if (selectedCell.classList.contains('fixed') || (selectedCell.innerText != "" && !selectedCell.classList.contains('error'))) return;

    const r = parseInt(selectedCell.dataset.row);
    const c = parseInt(selectedCell.dataset.col);
    
    selectedCell.innerText = solution[r][c];
    selectedCell.classList.remove('error');
    selectedCell.classList.add('hinted');
    
    hintsRemaining--;
    updateStatsUI();
    checkLineCompletion(r, c);
    checkWin();
}

function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    const overlay = document.getElementById('grid-overlay');

    if (isPaused) {
        pauseBtn.innerText = "▶️ Resume";
        overlay.classList.add('active');
        clearInterval(timer);
    } else {
        pauseBtn.innerText = "⏸️ Pause";
        overlay.classList.remove('active');
        startTimer();
    }
}


// 4. SYSTEMS & UTILITIES

function updateStatsUI() {
    const mDisplay = document.getElementById('mistakes-count');
    const hDisplay = document.getElementById('hints-count');
    const hBtn = document.getElementById('hint-btn');

    if (mDisplay) mDisplay.innerText = `Mistakes: ${mistakes}/${maxMistakes}`;
    // Updated to count 'Hints Used' from 0/3 upwards
    if (hDisplay) hDisplay.innerText = `Hints Used: ${3 - hintsRemaining}/3`;
    if (hBtn) hBtn.disabled = hintsRemaining <= 0;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').innerText = `Time: ${formatTime(secondsElapsed)}`;
    }, 1000);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function checkLineCompletion(row, col) {
    const cells = document.querySelectorAll('.cell');
    const getCell = (r, c) => cells[r * 9 + c];

    let rowComplete = true;
    for (let i = 0; i < 9; i++) {
        if (getCell(row, i).innerText == "" || getCell(row, i).classList.contains('error')) rowComplete = false;
    }
    if (rowComplete) {
        for (let i = 0; i < 9; i++) animateGlow(getCell(row, i));
    }

    let colComplete = true;
    for (let i = 0; i < 9; i++) {
        if (getCell(i, col).innerText == "" || getCell(i, col).classList.contains('error')) colComplete = false;
    }
    if (colComplete) {
        for (let i = 0; i < 9; i++) animateGlow(getCell(i, col));
    }

    let boxComplete = true;
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (getCell(startRow + r, startCol + c).innerText == "" || getCell(startRow + r, startCol + c).classList.contains('error')) boxComplete = false;
        }
    }
    if (boxComplete) {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) animateGlow(getCell(startRow + r, startCol + c));
        }
    }
}

function animateGlow(el) {
    el.classList.add('glow-success');
    setTimeout(() => el.classList.remove('glow-success'), 1000);
}

function checkWin() {
    const cells = document.querySelectorAll('.cell');
    const allCorrect = Array.from(cells).every(cell => {
        const val = parseInt(cell.innerText);
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        return val === solution[r][c];
    });
    
    if (allCorrect) {
        clearInterval(timer);
        handleWin();
    }
}

function handleWin() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    const timeTaken = formatTime(secondsElapsed);
    const msg = document.createElement('div');
    msg.className = 'win-banner';
    msg.innerHTML = `<h2>Excellent!</h2><p>You solved it in ${timeTaken}</p>`;
    document.body.appendChild(msg);

    const currentBest = localStorage.getItem('sudokuBestTime');
    if (!currentBest || secondsElapsed < currentBest) {
        localStorage.setItem('sudokuBestTime', secondsElapsed);
        bestTimeSpan.innerText = timeTaken;
    }

    setTimeout(() => {
        msg.style.opacity = '0';
        setTimeout(() => {
            msg.remove();
            resetGame(); 
        }, 500);
    }, 4000);
}

function handleGameOver() {
    clearInterval(timer);
    const msg = document.createElement('div');
    msg.className = 'game-over-banner';
    // Added 'control-button' class for consistent styling
    msg.innerHTML = `<h2>Game Over</h2><p>Too many mistakes!</p><button class="control-button" onclick="resetGame()">Try Again</button>`;
    document.body.appendChild(msg);
}


// 5. EVENT LISTENERS AND INITIAL CALL

document.addEventListener('keydown', (e) => {
    if (isPaused) return; // Ignore input if paused
    if (e.key >= '1' && e.key <= '9') {
        inputNumber(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        clearCell();
    }
});

// Start the game when the script loads
initGame();

