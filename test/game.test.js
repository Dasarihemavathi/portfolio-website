import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  placeFood,
  queueDirection,
  stepGame,
  togglePause
} from "../src/game.js";

test("snake moves one cell in the current direction", () => {
  const state = createInitialState(() => 0);
  const nextState = stepGame(state, () => 0);

  assert.deepEqual(nextState.snake[0], { x: state.snake[0].x + 1, y: state.snake[0].y });
  assert.equal(nextState.snake.length, state.snake.length);
});

test("snake grows and score increases when food is eaten", () => {
  const state = {
    ...createInitialState(() => 0),
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 }
    ],
    direction: "right",
    queuedDirection: "right",
    food: { x: 4, y: 3 }
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.score, 1);
  assert.equal(nextState.snake.length, 4);
  assert.deepEqual(nextState.snake[0], { x: 4, y: 3 });
});

test("reversing direction is ignored", () => {
  const state = createInitialState(() => 0);
  const nextState = queueDirection(state, "left");

  assert.equal(nextState.queuedDirection, "right");
});

test("wall collision ends the game", () => {
  const state = {
    ...createInitialState(() => 0),
    snake: [{ x: 0, y: 0 }],
    direction: "left",
    queuedDirection: "left",
    food: { x: 5, y: 5 }
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.status, "game-over");
});

test("self collision ends the game", () => {
  const state = {
    ...createInitialState(() => 0),
    snake: [
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 3, y: 3 },
      { x: 2, y: 3 }
    ],
    direction: "up",
    queuedDirection: "right",
    food: { x: 0, y: 0 }
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.status, "game-over");
});

test("food placement skips occupied cells", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ];

  const food = placeFood(snake, 2, () => 0);

  assert.deepEqual(food, { x: 1, y: 1 });
});

test("pause toggles running state and blocks movement", () => {
  const paused = togglePause(createInitialState(() => 0));
  const stepped = stepGame(paused, () => 0);

  assert.equal(paused.status, "paused");
  assert.deepEqual(stepped, paused);
});
