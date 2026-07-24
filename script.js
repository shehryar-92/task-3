(function () {
  const { makePuzzle, isValidPlacement, isBoardComplete, solvePuzzle } = window.SudokuLogic;

  const boardEl = document.getElementById('board');
  const messageEl = document.getElementById('message');
  const timerEl = document.getElementById('timer');
  const difficultySelect = document.getElementById('difficulty');
  const newGameBtn = document.getElementById('new-game');
  const checkBtn = document.getElementById('check');
  const solveBtn = document.getElementById('solve');
  const themeToggle = document.getElementById('theme-toggle');

  let puzzle = null;
  let solution = null;
  let cells = [];
  let timerInterval = null;
  let secondsElapsed = 0;

  function formatTime(s) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function startTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    timerEl.textContent = formatTime(0);
    timerInterval = setInterval(() => {
      secondsElapsed++;
      timerEl.textContent = formatTime(secondsElapsed);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function setMessage(text, type) {
    messageEl.textContent = text || '';
    messageEl.className = type || '';
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    cells = [];
    for (let r = 0; r < 9; r++) {
      const rowCells = [];
      for (let c = 0; c < 9; c++) {
        const input = document.createElement('input');
        input.className = 'cell';
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('maxlength', '1');
        input.dataset.row = r;
        input.dataset.col = c;
        input.addEventListener('input', onCellInput);
        input.addEventListener('keydown', onKeyNav);
        boardEl.appendChild(input);
        rowCells.push(input);
      }
      cells.push(rowCells);
    }
  }

  function renderPuzzle() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const input = cells[r][c];
        const value = puzzle[r][c];
        input.classList.remove('error');
        if (value !== 0) {
          input.value = value;
          input.classList.add('fixed');
          input.classList.remove('editable');
          input.disabled = true;
        } else {
          input.value = '';
          input.classList.remove('fixed');
          input.classList.add('editable');
          input.disabled = false;
        }
      }
    }
  }

  function currentGrid() {
    const grid = window.SudokuLogic.emptyGrid();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = parseInt(cells[r][c].value, 10);
        grid[r][c] = Number.isInteger(v) && v >= 1 && v <= 9 ? v : 0;
      }
    }
    return grid;
  }

  function onCellInput(e) {
    const input = e.target;
    let v = input.value.replace(/[^1-9]/g, '');
    input.value = v.slice(-1);
    setMessage('', '');
    input.classList.remove('error');

    if (input.value) {
      const r = parseInt(input.dataset.row, 10);
      const c = parseInt(input.dataset.col, 10);
      const grid = currentGrid();
      if (!isValidPlacement(grid, r, c, parseInt(input.value, 10))) {
        input.classList.add('error');
      }
    }

    const grid = currentGrid();
    if (grid.every((row) => row.every((val) => val !== 0))) {
      if (isBoardComplete(grid)) {
        setMessage('Solved! Nicely done.', 'success');
        stopTimer();
      } else {
        setMessage('All filled in, but something doesn\'t add up yet.', 'error');
      }
    }
  }

  function onKeyNav(e) {
    const r = parseInt(e.target.dataset.row, 10);
    const c = parseInt(e.target.dataset.col, 10);
    let target = null;
    if (e.key === 'ArrowRight') target = cells[r][Math.min(8, c + 1)];
    if (e.key === 'ArrowLeft') target = cells[r][Math.max(0, c - 1)];
    if (e.key === 'ArrowDown') target = cells[Math.min(8, r + 1)][c];
    if (e.key === 'ArrowUp') target = cells[Math.max(0, r - 1)][c];
    if (target) {
      e.preventDefault();
      target.focus();
    }
  }

  function newGame() {
    let difficulty = difficultySelect.value;
    if (difficulty === 'random') {
      const options = ['easy', 'medium', 'hard', 'expert'];
      difficulty = options[Math.floor(Math.random() * options.length)];
    }
    setMessage('Generating a fresh puzzle…', '');
    // Defer so the message can paint before the (synchronous) generation work.
    setTimeout(() => {
      const result = makePuzzle(difficulty);
      puzzle = result.puzzle;
      solution = result.solution;
      renderPuzzle();
      setMessage('', '');
      startTimer();
    }, 10);
  }

  function checkProgress() {
    const grid = currentGrid();
    let hasError = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cells[r][c].classList.remove('error');
        const val = grid[r][c];
        if (val !== 0 && !isValidPlacement(grid, r, c, val)) {
          cells[r][c].classList.add('error');
          hasError = true;
        }
      }
    }
    if (hasError) {
      setMessage('A few numbers conflict — check the highlighted cells.', 'error');
    } else if (grid.every((row) => row.every((v) => v !== 0))) {
      setMessage('Solved! Nicely done.', 'success');
      stopTimer();
    } else {
      setMessage('Looking good so far, keep going.', 'success');
    }
  }

  function revealSolution() {
    const grid = currentGrid();
    const solved = solvePuzzle(puzzle) || solution;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cells[r][c].value = solved[r][c];
        cells[r][c].classList.remove('error');
      }
    }
    setMessage('Here\'s the full solution.', 'success');
    stopTimer();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
  }

  newGameBtn.addEventListener('click', newGame);
  checkBtn.addEventListener('click', checkProgress);
  solveBtn.addEventListener('click', revealSolution);
  themeToggle.addEventListener('click', toggleTheme);

  buildBoard();
  newGame();
})();

