
const SIZE = 9;
const BOX = 3;

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSafe(grid, row, col, num) {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxRow = row - (row % BOX);
  const boxCol = col - (col % BOX);
  for (let r = 0; r < BOX; r++) {
    for (let c = 0; c < BOX; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }
  return true;
}

/**
 * Fills the grid using randomized backtracking, so every generated
 * full grid is a genuinely different valid Sudoku solution — not a
 * fixed pattern with relabeled digits.
 */
function fillGrid(grid) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateFullGrid() {
  const grid = emptyGrid();
  fillGrid(grid);
  return grid;
}

/** Counts solutions up to a cap (used to keep puzzles uniquely solvable). */
function countSolutions(grid, cap = 2) {
  let count = 0;

  function backtrack(g) {
    if (count >= cap) return;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (g[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(g, row, col, num)) {
              g[row][col] = num;
              backtrack(g);
              g[row][col] = 0;
              if (count >= cap) return;
            }
          }
          return;
        }
      }
    }
    count++;
  }

  const copy = grid.map((r) => r.slice());
  backtrack(copy);
  return count;
}

const DIFFICULTY_CLUES = {
  easy: 42,
  medium: 34,
  hard: 27,
  expert: 22,
};

/**
 * Removes cells one at a time (in random order), only keeping a removal
 * if the puzzle still has a unique solution. This means the resulting
 * puzzle's "hole pattern" is different every single time, not a reused template.
 */
function makePuzzle(difficulty = 'medium') {
  const solution = generateFullGrid();
  const puzzle = solution.map((r) => r.slice());
  const targetClues = DIFFICULTY_CLUES[difficulty] || DIFFICULTY_CLUES.medium;

  const cells = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE])
  );

  let clues = SIZE * SIZE;
  for (const [row, col] of cells) {
    if (clues <= targetClues) break;
    const backup = puzzle[row][col];
    if (backup === 0) continue;
    puzzle[row][col] = 0;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[row][col] = backup; // removing this cell breaks uniqueness — put it back
    } else {
      clues--;
    }
  }

  return { puzzle, solution };
}

function isValidPlacement(grid, row, col, num) {
  if (num === 0) return true;
  const g = grid.map((r) => r.slice());
  g[row][col] = 0;
  return isSafe(g, row, col, num);
}

function isBoardComplete(grid) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (grid[row][col] === 0) return false;
      if (!isValidPlacement(grid, row, col, grid[row][col])) return false;
    }
  }
  return true;
}

function solveGrid(grid) {
  const copy = grid.map((r) => r.slice());
  fillGrid(copy); // note: relies on 0-cells only; won't respect fixed clues if grid partially wrong
  return copy;
}

/** Solves respecting existing fixed numbers (proper solver used by the UI's "Solve" button). */
function solvePuzzle(grid) {
  const g = grid.map((r) => r.slice());

  function backtrack() {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (g[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(g, row, col, num)) {
              g[row][col] = num;
              if (backtrack()) return true;
              g[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  const solved = backtrack();
  return solved ? g : null;
}

const api = {
  SIZE,
  emptyGrid,
  generateFullGrid,
  makePuzzle,
  isValidPlacement,
  isBoardComplete,
  solvePuzzle,
  countSolutions,
  DIFFICULTY_CLUES,
};

// Support both browser (window) and Node (module.exports / require) usage.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof window !== 'undefined') {
  window.SudokuLogic = api;
}


