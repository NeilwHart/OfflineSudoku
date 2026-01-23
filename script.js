// script.js - Offline Sudoku for Samsung A05s (Dynamic Difficulty)

let timer;
let secondsElapsed = 0;
const gridElement = document.getElementById('grid');
const bestTimeSpan = document.getElementById('best-time');
// Initialize with a default difficulty
let currentDifficulty = 'medium'; 

// 1. Initial Puzzle and Solution variables (will be populated dynamically)
let puzzle = [];
let solution = [];

// Helper function to handle difficulty change from HTML
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    resetGame(); 
}

// Function to start a fresh game
function resetGame() {
    clearInterval(timer); // Stop the current timer
    secondsElapsed = 0;   // Reset time
    if (gridElement) {
        gridElement.innerHTML = ''; // Clear the grid visually
    }
    initGame(); // Start a new game with the current difficulty
}

let selectedCell = null; // Tracks the currently active box

// Initialize Game
function initGame() {
    solution = generateSolution();
    puzzle = createPuzzle(solution); 
    
    const storedBest = localStorage.getItem('sudokuBestTime');
    if (storedBest) bestTimeSpan.innerText = formatTime(storedBest);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Border logic (retained)
            if ((c + 1) % 3 === 0 && c < 8) cell.style.borderRight = "3px solid #121df1";
            if ((r + 1) % 3 === 0 && r < 8) cell.style.borderBottom = "3px solid #121df1";

            if (puzzle[r][c] !== 0) {
                cell.innerText = puzzle[r][c];
                cell.classList.add('fixed');
            } else {
                // Click to select the cell
                cell.onclick = () => {
                    if (selectedCell) selectedCell.classList.remove('selected');
                    selectedCell = cell;
                    selectedCell.classList.add('selected');
                    // Store row/col data for validation
                    selectedCell.dataset.row = r;
                    selectedCell.dataset.col = c;
                };
            }
            gridElement.appendChild(cell);
        }
    }
    startTimer();
}

// Function triggered by the number pad buttons
function inputNumber(num) {
    if (!selectedCell) return;

    const r = selectedCell.dataset.row;
    const c = selectedCell.dataset.col;

    selectedCell.innerText = num;

    // Mistake Highlighting
    if (num !== solution[r][c]) {
        selectedCell.classList.add('error');
    } else {
        selectedCell.classList.remove('error');
        checkWin();
    }
}

function clearCell() {
    if (selectedCell) {
        selectedCell.innerText = "";
        selectedCell.classList.remove('error');
    }
}

// Updated checkWin for non-input elements
function checkWin() {
    const cells = document.querySelectorAll('.cell');
    const allCorrect = Array.from(cells).every(cell => {
        const val = parseInt(cell.innerText);
        return val > 0 && !cell.classList.contains('error');
    });
    
    if (allCorrect) {
        clearInterval(timer);
        alert(`You Won!`);
    }
}


// 3. Timer Logic
function startTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    timer = setInterval(() => {
        secondsElapsed++;
        timerElement.innerText = `Time: ${formatTime(secondsElapsed)}`;
    }, 1000);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// 4. Save Best Time Offline and Win Condition
function checkWin() {
    const inputs = document.querySelectorAll('input');
    const allCorrect = Array.from(inputs).every(i => i.value && parseInt(i.value) > 0 && !i.classList.contains('error'));
    
    if (allCorrect && inputs.length > 0) {
        clearInterval(timer);
        alert(`You Won in ${formatTime(secondsElapsed)}!`);
        
        const currentBest = localStorage.getItem('sudokuBestTime');
        if (!currentBest || secondsElapsed < currentBest) {
            localStorage.setItem('sudokuBestTime', secondsElapsed);
            bestTimeSpan.innerText = formatTime(secondsElapsed);
            alert("New Record!");
        }
    }
}

// --- Sudoku Generation Logic ---

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
        case 'easy': cluesToKeep = 35; break; // Adjusted for better playability
        case 'medium': cluesToKeep = 28; break; 
        case 'hard': cluesToKeep = 22; break;
        default: cluesToKeep = 28;
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

initGame();
