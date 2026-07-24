const {
  generateFullGrid,
  makePuzzle,
  isValidPlacement,
  isBoardComplete,
  solvePuzzle,
  countSolutions,
} = require('./sudoku-logic.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.log(`  FAIL: ${message}`);
  }
}

function isValidFullGrid(grid) {
  for (let i = 0; i < 9; i++) {
    const row = new Set(grid[i]);
    const col = new Set(grid.map((r) => r[i]));
    if (row.size !== 9 || col.size !== 9) return false;
  }
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const box = new Set();
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) box.add(grid[br + r][bc + c]);
      if (box.size !== 9) return false;
    }
  }
  return true;
}

console.log('Test: generateFullGrid produces a complete valid Sudoku grid');
{
  const grid = generateFullGrid();
  assert(grid.length === 9 && grid.every((r) => r.length === 9), 'grid is 9x9');
  assert(
    grid.every((row) => row.every((v) => v >= 1 && v <= 9)),
    'all cells filled with 1-9'
  );
  assert(isValidFullGrid(grid), 'grid satisfies row/col/box constraints');
}

console.log('\nTest: two generated grids are different (randomness check)');
{
  const g1 = generateFullGrid();
  const g2 = generateFullGrid();
  const same = JSON.stringify(g1) === JSON.stringify(g2);
  assert(!same, 'two consecutive generated grids are not identical');
}

console.log('\nTest: makePuzzle returns a puzzle consistent with its solution');
{
  const { puzzle, solution } = makePuzzle('medium');
  assert(isValidFullGrid(solution), 'solution is a valid complete grid');
  let consistent = true;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] !== 0 && puzzle[r][c] !== solution[r][c]) consistent = false;
    }
  }
  assert(consistent, 'every clue in the puzzle matches the solution');
}

console.log('\nTest: makePuzzle has a unique solution');
{
  const { puzzle } = makePuzzle('hard');
  const solutionCount = countSolutions(puzzle, 2);
  assert(solutionCount === 1, 'puzzle has exactly one solution');
}

console.log('\nTest: difficulty levels produce different clue counts');
{
  const easyClues = makePuzzle('easy').puzzle.flat().filter((v) => v !== 0).length;
  const expertClues = makePuzzle('expert').puzzle.flat().filter((v) => v !== 0).length;
  assert(easyClues > expertClues, 'easy puzzle has more clues than expert puzzle');
}

console.log('\nTest: two generated puzzles have different blank-cell patterns');
{
  const p1 = makePuzzle('medium').puzzle;
  const p2 = makePuzzle('medium').puzzle;
  const same = JSON.stringify(p1) === JSON.stringify(p2);
  assert(!same, 'two consecutive puzzles are not identical (different hole pattern)');
}

console.log('\nTest: isValidPlacement detects conflicts correctly');
{
  const grid = generateFullGrid();
  const r = 0,
    c = 0;
  const correctValue = grid[r][c];
  assert(isValidPlacement(grid, r, c, correctValue), 'correct value is valid in its own cell');

  const rowConflictGrid = grid.map((row) => row.slice());
  rowConflictGrid[r][c] = 0;
  const conflictingValue = grid[r][1]; // value already used elsewhere in row 0
  assert(
    !isValidPlacement(rowConflictGrid, r, c, conflictingValue),
    'value already present in row is correctly rejected'
  );
}

console.log('\nTest: isBoardComplete correctly identifies complete vs incomplete boards');
{
  const grid = generateFullGrid();
  assert(isBoardComplete(grid), 'fully solved valid grid is reported complete');

  const incomplete = grid.map((row) => row.slice());
  incomplete[0][0] = 0;
  assert(!isBoardComplete(incomplete), 'grid with an empty cell is reported incomplete');

  const invalid = grid.map((row) => row.slice());
  const tmp = invalid[0][0];
  invalid[0][0] = invalid[0][1];
  invalid[0][1] = tmp === invalid[0][1] ? tmp : invalid[0][1]; // ensure duplicate in row
  invalid[0][0] = invalid[0][1];
  assert(!isBoardComplete(invalid), 'grid with a rule violation is reported incomplete');
}

console.log('\nTest: solvePuzzle solves a partially filled puzzle correctly');
{
  const { puzzle, solution } = makePuzzle('easy');
  const solved = solvePuzzle(puzzle);
  assert(solved !== null, 'solver finds a solution');
  assert(JSON.stringify(solved) === JSON.stringify(solution), 'solved grid matches known solution');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

