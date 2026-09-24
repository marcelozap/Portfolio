import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dragonHeading,
  easeDragonHeading,
  MAX_DRAGON_TILT,
} from '../src/lib/play/dragon-marker-motion';

test('quiet mobile price changes do not snap the head to maximum tilt', () => {
  const prices = Array.from({ length: 12 }, (_, i) => 5 + i * 0.001);
  const angle = dragonHeading(prices, 1, 100, 0.65);
  assert.ok(angle < 0 && angle > -0.05);
});

test('strong moves point in either direction and stay within a gentle tilt', () => {
  const rising = Array.from({ length: 12 }, (_, i) => i + 1);
  assert.equal(dragonHeading(rising, 12, 400, 0.65), -MAX_DRAGON_TILT);
  assert.equal(dragonHeading([...rising].reverse(), 12, 400, 3), MAX_DRAGON_TILT);
  assert.equal(dragonHeading(Array(12).fill(5), 1, 400, 1), 0);
});

test('heading reaches the same position at 30 and 60 frames per second', () => {
  const simulate = (frames: number) => {
    let angle = 0;
    for (let i = 0; i < frames; i++)
      angle = easeDragonHeading(angle, MAX_DRAGON_TILT, 1000 / frames);
    return angle;
  };
  assert.ok(Math.abs(simulate(30) - simulate(60)) < 1e-12);
  assert.ok(simulate(30) < MAX_DRAGON_TILT);
});

test('redraws without elapsed time leave orientation alone and invalid data stays finite', () => {
  assert.equal(easeDragonHeading(0.1, -0.2, 0), 0.1);
  assert.equal(easeDragonHeading(0.1, -0.2, -50), 0.1);
  assert.equal(dragonHeading([], 1, 100, 1), 0);
  assert.equal(dragonHeading([5, Number.NaN], 1, 100, 1), 0);
  assert.equal(dragonHeading([5, 6], 0, 100, 1), 0);
});
