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

// 2. Initialize Game
function initGame() {
    // Generate new puzzle and solution based on selected difficulty
    solution = generateSolution();
    puzzle = createPuzzle(solution); 
    
    // Load Best Time from LocalStorage
    const storedBest = localStorage.getItem('sudokuBestTime');
    if (storedBest) bestTimeSpan.innerText = formatTime(storedBest);

    // Create Grid Cells
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            if (puzzle[r][c] !== 0) {
                cell.innerText = puzzle[r][c];
                cell.style.background = "#f0f0f0"; // Light grey for fixed numbers
            } else {
                const input = document.createElement('input');
                input.type = 'number';
                input.pattern = "[1-9]*";
                input.inputMode = "numeric"; // Best for Samsung keyboard
                
                input.oninput = (e) => {
                    const val = parseInt(e.target.value);
                    // Mistake Highlighting: Check against the new solution
                    if (val && val !== solution[r][c]) {
                        input.classList.add('error'); // Triggers red text in CSS
                    } else {
                        input.classList.remove('error');
                        checkWin();
                    }
                };
                cell.appendChild(input);
            }
            gridElement.appendChild(cell);
        }
    }
    startTimer();
}

// 3. Timer Logic
function startTimer() {
    // Ensure the element for timer display exists (assuming ID 'timer' in HTML)
    const timerElement = document.getElementById('timer');
    if (!timerElement) {
        console.error("Timer element not found!");
        return;
    }
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
    // Check if all inputs are filled and correct
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

/**
 * Generates a complete, valid Sudoku grid using backtracking.
 * @returns {Array<Array<number>>} A solved 9x9 Sudoku grid.
 */
function generateSolution() {
    const board = Array(9).fill(0).map(() => Array(9).fill(0));
    solve(board);
    return board;
}

/**
 * Recursive backtracking function to fill the Sudoku board.
 */
function solve(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                // Try numbers in a random order for variety
                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (const num of numbers) {
                    if (isValid(board, num, r, c)) {
                        board[r][c] = num;
                        if (solve(board)) return true;
                        board[r][c] = 0; // Backtrack
                    }
                }
                return false;
            }
        }
    }
    return true; // Board is full
}

/**
 * Checks if a number is valid in a given position.
 */
function isValid(board, num, row, col) {
    // Check row and column
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[startRow + r][startCol + c] === num) return false;
        }
    }
    return true;
}

/**
 * Creates the puzzle by removing a certain number of cells from the solution
 * based on the current difficulty setting.
 */
function createPuzzle(solution) {
    const puzzle = solution.map(row => [...row]); // Deep copy

    // Define target number of clues based on difficulty
    let cluesToKeep;
    switch (currentDifficulty) {
        case 'easy':
            cluesToKeep = 42; 
            break;
        case 'medium':
            cluesToKeep = 32; 
            break;
        case 'hard':
            cluesToKeep = 24; 
            break;
        default:
            cluesToKeep = 32; // Default to medium
    }

    let cellsRevealed = 81;

    while (cellsRevealed > cluesToKeep) {
        // Pick a random cell
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);

        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            cellsRevealed--;
        }
    }
    return puzzle;
}


// Start the game when the script loads
initGame();
