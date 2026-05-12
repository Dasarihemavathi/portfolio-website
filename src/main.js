import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  queueDirection,
  stepGame,
  toKey,
  togglePause
} from "./game.js";

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const overlayElement = document.querySelector("#overlay");
const overlayMessageElement = document.querySelector("#overlay-message");
const restartButton = document.querySelector("#restart-button");
const overlayRestartButton = document.querySelector("#overlay-restart");
const controlButtons = document.querySelectorAll("[data-direction]");
const scoresListElement = document.querySelector("#scores-list");

let state = createInitialState();
let scoreSavedForCurrentRound = false;

function renderBoard() {
  const snakeMap = new Map(state.snake.map((segment, index) => [toKey(segment), index]));

  const cells = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x},${y}`;
      const classes = ["cell"];

      if (state.food.x === x && state.food.y === y) {
        classes.push("cell--food");
      }

      if (snakeMap.has(key)) {
        classes.push("cell--snake");
        if (snakeMap.get(key) === 0) {
          classes.push("cell--head");
        }
      }

      cells.push(`<div class="${classes.join(" ")}" role="gridcell" aria-label="Cell ${x + 1}, ${y + 1}"></div>`);
    }
  }

  boardElement.innerHTML = cells.join("");
}

function renderStatus() {
  scoreElement.textContent = String(state.score);

  if (state.status === "game-over") {
    statusElement.textContent = "Game over";
    overlayMessageElement.textContent = `Game over. Final score: ${state.score}`;
    overlayElement.hidden = false;
    return;
  }

  overlayElement.hidden = true;
  statusElement.textContent = state.status === "paused" ? "Paused" : "Running";
}

function render() {
  renderBoard();
  renderStatus();
}

function updateGame() {
  const previousStatus = state.status;
  state = stepGame(state);

  if (previousStatus !== "game-over" && state.status === "game-over") {
    maybeSaveScore(state.score);
  }

  render();
}

function restart() {
  state = createInitialState();
  scoreSavedForCurrentRound = false;
  render();
}

function setDirection(direction) {
  state = queueDirection(state, direction);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const directionByKey = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right"
  };

  if (directionByKey[key]) {
    event.preventDefault();
    setDirection(directionByKey[key]);
    return;
  }

  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (key === "enter" && state.status === "game-over") {
    event.preventDefault();
    restart();
  }
});

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    setDirection(button.dataset.direction);
  });
}

restartButton.addEventListener("click", restart);
overlayRestartButton.addEventListener("click", restart);

async function loadTopScores() {
  try {
    const response = await fetch("/api/scores");
    if (!response.ok) {
      throw new Error("Failed to fetch scores");
    }

    const data = await response.json();
    scoresListElement.innerHTML = "";

    if (!Array.isArray(data.scores) || data.scores.length === 0) {
      scoresListElement.innerHTML = "<li>No scores yet.</li>";
      return;
    }

    for (const item of data.scores) {
      const li = document.createElement("li");
      li.textContent = `${item.score} points`;
      scoresListElement.append(li);
    }
  } catch {
    scoresListElement.innerHTML = "<li>Could not load scores.</li>";
  }
}

async function maybeSaveScore(score) {
  if (scoreSavedForCurrentRound) {
    return;
  }

  scoreSavedForCurrentRound = true;
  try {
    await fetch("/api/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ score })
    });
  } catch {
    // Keep gameplay uninterrupted if score saving fails.
  } finally {
    loadTopScores();
  }
}

window.setInterval(updateGame, TICK_MS);
render();
loadTopScores();
