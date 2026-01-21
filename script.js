// script.js - Offline Sudoku for Samsung A05s (Hard Difficulty)
let timer;
let secondsElapsed = 0;
const gridElement = document.getElementById('grid');
const bestTimeSpan = document.getElementById('best-time');

// 1. Initial Hard Puzzle (0 represents an empty cell)
const puzzle = [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 6, 0, 0],
    [0, 0, 0, 0, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Solution for this specific puzzle for verification
const solution = [
    [4, 3, 5, 2, 6, 9, 7, 8, 1],
    [6, 8, 2, 5, 7, 1, 4, 9, 3],
    [1, 9, 7, 8, 3, 4, 6, 5, 2],
    [8, 2, 6, 1, 9, 5, 3, 4, 7],
    [3, 7, 4, 6, 8, 2, 9, 1, 5],
    [9, 5, 1, 7, 4, 3, 8, 6, 2],
    [5, 1, 9, 3, 2, 6, 7, 4, 8],
    [2, 4, 8, 9, 5, 7, 1, 3, 6],
    [7, 6, 3, 4, 1, 8, 2, 5, 9]
];

// 2. Initialize Game
function initGame() {
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
                    // Mistake Highlighting: Check against solution
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

// 4. Save Best Time Offline
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

initGame();
