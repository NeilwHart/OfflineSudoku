/** 
 * Sudoku Pro Engine - Latest Version 2026
 * Features: Pause System, 3 Mistakes Game Over, 3 Hint Limit
 */

// Load the Confetti Library (Latest Stable 1.9.4)
const confettiScript = document.createElement('script');
confettiScript.src = 'https://cdn.jsdelivr.net';
document.head.appendChild(confettiScript);

// Game State Variables
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

// 1. INITIALIZATION & CONTROLS
function initGame() {
    solution = generateSolution();
    puzzle = createPuzzle(solution); 
    
    // Load local storage for Best Time
    const storedBest = localStorage.getItem('sudokuBestTime');
    if (storedBest) bestTimeSpan.innerText = formatTime(storedBest);

    updateStatsUI(); // Initialize display

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Grid Visuals
            if ((c + 1) % 3 === 0 && c < 8) cell.style.borderRight = "3px solid #121df1";
            if ((r + 1) % 3 === 0 && r < 8) cell.style.borderBottom = "3px solid #121df1";

            cell.dataset.row = r;
            cell.dataset.col = c;

            if (puzzle[r][c] !== 0) {
                cell.innerText = puzzle[r][c];
                cell.classList.add('fixed');
            } else {
                cell.onclick = () => {
                    if (isPaused) return; // Anti-cheat
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

function resetGame() {
    clearInterval(timer);
    secondsElapsed = 0;
    hintsRemaining = 3;
    mistakes = 0;
    isPaused = false;
    
    const overlay = document.getElementById('grid-overlay');
    if (overlay) overlay.classList.remove('active');
    
    if (gridElement) gridElement.innerHTML = '';
    initGame();
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    resetGame(); 
}

// 2. CORE GAMEPLAY LOGIC
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

// 3. SYSTEMS: PAUSE, WIN, LOSS
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

function handleGameOver() {
    clearInterval(timer);
    const msg = document.createElement('div');
    msg.className = 'game-over-banner';
    msg.innerHTML = `<h2>Game Over</h2><p>3 Mistakes reached.</p><button onclick="resetGame()">Try Again</button>`;
    document.body.appendChild(msg);
}

function handleWin() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    const timeTaken = formatTime(secondsElapsed);
    
    const currentBest = localStorage.getItem('sudokuBestTime');
    if (!currentBest || secondsElapsed < currentBest) {
        localStorage.setItem('sudokuBestTime', secondsElapsed);
        bestTimeSpan.innerText = timeTaken;
    }

    setTimeout(() => resetGame(), 4000);
}

// 4. UTILITIES
function updateStatsUI() {
    const mDisplay = document.getElementById('mistakes-count');
    const hDisplay = document.getElementById('hints-count');
    const hBtn = document.getElementById('hint-btn');

    if (mDisplay) mDisplay.innerText = `Mistakes: ${mistakes}/${maxMistakes}`;
    if (hDisplay) hDisplay.innerText = `Hints: ${hintsRemaining}/3`;
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

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (isPaused) return;
    if (e.key >= '1' && e.key <= '9') inputNumber(parseInt(e.key));
    if (e.key === 'Backspace') clearCell();
});

// Row/Col/Box Glow & Sudoku Logic (generateSolution/solve/isValid/createPuzzle)
// ... Keep your existing generation logic here ...

initGame();
