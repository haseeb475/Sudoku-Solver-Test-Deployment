let currentGrid = [];
let solutions = [];
let currentSolutionIndex = 0;
let size = 9;
let boxSize = 3;

function calculateBoxSize(gridSize) {
    let bestWidth = 1;
    let bestHeight = gridSize;
    let minDiff = gridSize - 1;
    
    for (let i = 1; i <= Math.sqrt(gridSize); i++) {
        if (gridSize % i === 0) {
            const diff = Math.abs(i - (gridSize / i));
            if (diff < minDiff) {
                minDiff = diff;
                bestWidth = i;
                bestHeight = gridSize / i;
            }
        }
    }
    return [Math.min(bestWidth, bestHeight), Math.max(bestWidth, bestHeight)];
}

function createGrid() {
    size = parseInt(document.getElementById('gridSize').value);
    const [boxWidth, boxHeight] = calculateBoxSize(size);
    boxSize = boxWidth;
    
    currentGrid = Array(size).fill().map(() => Array(size).fill(0));
    solutions = [];
    currentSolutionIndex = 0;
    
    const gridElement = document.getElementById('grid');
    gridElement.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    gridElement.innerHTML = '';
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if ((j + 1) % boxHeight === 0 && j < size - 1) {
                cell.classList.add('box-right');
            }
            if ((i + 1) % boxWidth === 0 && i < size - 1) {
                cell.classList.add('box-bottom');
            }
            
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = size.toString().length;
            input.dataset.row = i;
            input.dataset.col = j;
            input.addEventListener('input', validateInput);
            cell.appendChild(input);
            gridElement.appendChild(cell);
        }
    }
    
    document.querySelector('.solutions-nav').style.display = 'none';
    document.getElementById('error').textContent = '';
}

function validateInput(event) {
    const input = event.target;
    const value = input.value;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    
    if (value === '') {
        currentGrid[row][col] = 0;
        return;
    }
    
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > size) {
        input.value = '';
        currentGrid[row][col] = 0;
        showError(`Please enter a number between 1 and ${size}`);
        return;
    }
    
    if (!isValidMove(currentGrid, row, col, num)) {
        input.value = '';
        currentGrid[row][col] = 0;
        showError('Invalid number for this position');
        return;
    }
    
    currentGrid[row][col] = num;
    document.getElementById('error').textContent = '';
}

function isValidMove(grid, row, col, num) {
    for (let x = 0; x < size; x++) {
        if (x !== col && grid[row][x] === num) return false;
    }
    
    for (let x = 0; x < size; x++) {
        if (x !== row && grid[x][col] === num) return false;
    }
    
    const [boxWidth, boxHeight] = calculateBoxSize(size);
    const boxRow = Math.floor(row / boxWidth) * boxWidth;
    const boxCol = Math.floor(col / boxHeight) * boxHeight;
    
    for (let i = 0; i < boxWidth; i++) {
        for (let j = 0; j < boxHeight; j++) {
            if (boxRow + i !== row && boxCol + j !== col && 
                grid[boxRow + i][boxCol + j] === num) return false;
        }
    }
    
    return true;
}

function solveAll() {
    solutions = [];
    findAllSolutions([...currentGrid.map(row => [...row])]);
    
    if (solutions.length === 0) {
        showError('No solutions found!');
        return;
    }
    
    currentSolutionIndex = 0;
    displaySolution();
    document.querySelector('.solutions-nav').style.display = 'block';
    document.getElementById('solutionCount').textContent = 
        `Solution ${currentSolutionIndex + 1} of ${solutions.length}`;
}

function findAllSolutions(grid) {
    if (solutions.length >= 100) return;
    
    let row = -1;
    let col = -1;
    let isEmpty = false;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === 0) {
                row = i;
                col = j;
                isEmpty = true;
                break;
            }
        }
        if (isEmpty) break;
    }
    
    if (!isEmpty) {
        solutions.push(grid.map(row => [...row]));
        return;
    }
    
    for (let num = 1; num <= size; num++) {
        if (isValidMove(grid, row, col, num)) {
            grid[row][col] = num;
            findAllSolutions(grid);
            grid[row][col] = 0;
        }
    }
}

function solveCell() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (currentGrid[i][j] === 0) {
                for (let num = 1; num <= size; num++) {
                    if (isValidMove(currentGrid, i, j, num)) {
                        const tempGrid = currentGrid.map(row => [...row]);
                        tempGrid[i][j] = num;
                        if (isSolvable(tempGrid)) {
                            currentGrid[i][j] = num;
                            updateDisplay();
                            return;
                        }
                    }
                }
                showError('No valid number for next empty cell');
                return;
            }
        }
    }
    showError('Grid is already complete');
}

function isSolvable(grid) {
    let row = -1;
    let col = -1;
    let isEmpty = false;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === 0) {
                row = i;
                col = j;
                isEmpty = true;
                break;
            }
        }
        if (isEmpty) break;
    }
    
    if (!isEmpty) return true;
    
    for (let num = 1; num <= size; num++) {
        if (isValidMove(grid, row, col, num)) {
            grid[row][col] = num;
            if (isSolvable(grid)) return true;
            grid[row][col] = 0;
        }
    }
    
    return false;
}

function resetGrid() {
    createGrid();
}

function nextSolution() {
    if (currentSolutionIndex < solutions.length - 1) {
        currentSolutionIndex++;
        displaySolution();
        document.getElementById('solutionCount').textContent = 
            `Solution ${currentSolutionIndex + 1} of ${solutions.length}`;
    }
}

function previousSolution() {
    if (currentSolutionIndex > 0) {
        currentSolutionIndex--;
        displaySolution();
        document.getElementById('solutionCount').textContent = 
            `Solution ${currentSolutionIndex + 1} of ${solutions.length}`;
    }
}

function displaySolution() {
    const solution = solutions[currentSolutionIndex];
    const inputs = document.querySelectorAll('.cell input');
    
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        input.value = solution[row][col];
    });
    
    currentGrid = solution.map(row => [...row]);
}

function updateDisplay() {
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        input.value = currentGrid[row][col] || '';
    });
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = '';
    }, 3000);
}

// Initialize the grid when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createGrid();
});
