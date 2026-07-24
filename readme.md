# Sudoku

A browser-based Sudoku game that generates a genuinely new puzzle every time you play — never the same layout or hole pattern twice.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure — the board, controls, and status bar. |
| `style.css` | Light, low-contrast theme with a one-click dark mode toggle. |
| `sudoku-logic.js` | The engine: grid generation, uniqueness checking, and the solver. No DOM code — works in the browser or Node. |
| `script.js` | UI layer — builds the board, handles typing/arrow-key navigation, live conflict highlighting, timer, and button actions. |
| `sudoku-logic.test.js` | Test suite for the engine (16 checks). |

## Running it

Just open `index.html` in any browser. No build step, no dependencies, no server required.

To run the tests instead:
```
node sudoku-logic.test.js
```

## How the randomness works

Most simple Sudoku generators reuse a small set of base grids and just relabel the digits or rotate/reflect them, so puzzles start feeling repetitive fast. This one avoids that:

1. **Full grid** — built from scratch with randomized backtracking. At each empty cell, the candidate digits 1–9 are shuffled before being tried, so the search explores a different path (and lands on a different completed grid) every run.
2. **Removing clues** — cells are knocked out one at a time in random order. After each removal, the puzzle is re-checked with a solution counter (capped at 2) to confirm it still has **exactly one** solution. If removing a cell would create an ambiguous puzzle, that cell is put back and a different one is tried.
3. **Difficulty** — controls roughly how many clues remain:

   | Difficulty | Clues remaining |
   |---|---|
   | Easy | ~42 |
   | Medium | ~34 |
   | Hard | ~27 |
   | Expert | ~22 |

4. **"Random" mode** (the default in the dropdown) picks one of the four difficulties at random on top of the above, so even repeated "New Puzzle" clicks feel different in both layout and challenge level.

## Features

- Arrow-key navigation between cells
- Live highlighting of conflicting entries as you type
- Timer that stops automatically on a correct solve
- **Check** — validates your current progress without giving anything away
- **Solve** — reveals the full solution
- Light theme by default, with a dark mode toggle in the header

## Notes on the code

- `sudoku-logic.js` is written to work both as a browser `<script>` (attaches to `window.SudokuLogic`) and as a Node module (`module.exports`), which is what lets the same file be exercised directly by the test suite.
- The solution-uniqueness check is capped at 2 solutions found rather than exhaustively counting all of them — that's enough to confirm uniqueness (or catch ambiguity) without the extra generation time a full count would cost.

