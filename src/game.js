export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createInitialState(random = Math.random, gridSize = GRID_SIZE) {
  const midpoint = Math.floor(gridSize / 2);
  const snake = [
    { x: midpoint, y: midpoint },
    { x: midpoint - 1, y: midpoint },
    { x: midpoint - 2, y: midpoint }
  ];

  return {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    queuedDirection: INITIAL_DIRECTION,
    food: placeFood(snake, gridSize, random),
    score: 0,
    status: "running"
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state;
  }

  const activeDirection = state.queuedDirection ?? state.direction;
  if (OPPOSITES[activeDirection] === nextDirection) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection
  };
}

export function stepGame(state, random = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.queuedDirection ?? state.direction;
  const vector = DIRECTION_VECTORS[direction];
  const nextHead = {
    x: state.snake[0].x + vector.x,
    y: state.snake[0].y + vector.y
  };

  const willEat = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (isOutOfBounds(nextHead, state.gridSize) || hitsSnake(nextHead, bodyToCheck)) {
    return {
      ...state,
      direction,
      queuedDirection: direction,
      status: "game-over"
    };
  }

  const snake = [nextHead, ...state.snake];
  if (!willEat) {
    snake.pop();
  }

  return {
    ...state,
    snake,
    direction,
    queuedDirection: direction,
    food: willEat ? placeFood(snake, state.gridSize, random) : state.food,
    score: willEat ? state.score + 1 : state.score
  };
}

export function togglePause(state) {
  if (state.status === "game-over") {
    return state;
  }

  return {
    ...state,
    status: state.status === "paused" ? "running" : "paused"
  };
}

export function placeFood(snake, gridSize, random = Math.random) {
  const occupied = new Set(snake.map(toKey));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = { x, y };
      if (!occupied.has(toKey(cell))) {
        openCells.push(cell);
      }
    }
  }

  if (openCells.length === 0) {
    return snake[0];
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function toKey(position) {
  return `${position.x},${position.y}`;
}

function isOutOfBounds(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

function hitsSnake(position, snake) {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}
