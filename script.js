// Load Confetti Library correctly
// Load the Confetti Library (Latest 2026 Stable Version)
const confettiScript = document.createElement('script');
confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
document.head.appendChild(confettiScript);

let timer;
let secondsElapsed = 0;
const gridElement = document.getElementById('grid');
const bestTimeSpan = document.getElementById('best-time');
let currentDifficulty = 'medium'; 

let puzzle = [];
let solution = [];
let selectedCell = null;

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    resetGame(); 
}

function resetGame() {
    clearInterval(timer);
    secondsElapsed = 0;
    if (gridElement) gridElement.innerHTML = '';
    initGame();
}

function initGame() {
    solution = generateSolution();
    puzzle = createPuzzle(solution); 
    
    const storedBest = localStorage.getItem('sudokuBestTime');
    if (storedBest) bestTimeSpan.innerText = formatTime(storedBest);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Border logic
            if ((c + 1) % 3 === 0 && c < 8) cell.style.borderRight = "3px solid #121df1";
            if ((r + 1) % 3 === 0 && r < 8) cell.style.borderBottom = "3px solid #121df1";

            cell.dataset.row = r;
            cell.dataset.col = c;

            if (puzzle[r][c] !== 0) {
                cell.innerText = puzzle[r][c];
                cell.classList.add('fixed');
            } else {
                cell.onclick = () => {
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
    if (!selectedCell) return;

    const r = parseInt(selectedCell.dataset.row);
    const c = parseInt(selectedCell.dataset.col);

    selectedCell.innerText = num;

    if (num !== solution[r][c]) {
        selectedCell.classList.add('error');
    } else {
        selectedCell.classList.remove('error');
        checkLineCompletion(r, c); // Glow check
        checkWin(); // Win check
    }
}

// GLOW ANIMATION LOGIC
function checkLineCompletion(row, col) {
    const cells = document.querySelectorAll('.cell');
    const getCell = (r, c) => cells[r * 9 + c];

    // Check Row
    let rowComplete = true;
    for (let i = 0; i < 9; i++) {
        if (getCell(row, i).innerText == "" || getCell(row, i).classList.contains('error')) rowComplete = false;
    }
    if (rowComplete) {
        for (let i = 0; i < 9; i++) animateGlow(getCell(row, i));
    }

    // Check Column
    let colComplete = true;
    for (let i = 0; i < 9; i++) {
        if (getCell(i, col).innerText == "" || getCell(i, col).classList.contains('error')) colComplete = false;
    }
    if (colComplete) {
        for (let i = 0; i < 9; i++) animateGlow(getCell(i, col));
    }

    // Check Box
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

// WIN AND AUTO-RESTART LOGIC
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

    // New Game start after 4 seconds
    setTimeout(() => {
        msg.style.opacity = '0';
        setTimeout(() => {
            msg.remove();
            resetGame(); 
        }, 500);
    }, 4000);
}

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

// GENERATION LOGIC
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
