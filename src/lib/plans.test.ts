import { test } from 'node:test';
import assert from 'node:assert';
import { getPlanLimits, PLANS } from './plans.ts';

test('getPlanLimits returns correct limits for free plan', () => {
  assert.deepStrictEqual(getPlanLimits('free'), PLANS.free);
});

test('getPlanLimits returns correct limits for basic plan', () => {
  assert.deepStrictEqual(getPlanLimits('basic'), PLANS.basic);
});

test('getPlanLimits returns correct limits for pro plan', () => {
  assert.deepStrictEqual(getPlanLimits('pro'), PLANS.pro);
});

test('getPlanLimits returns correct limits for business plan', () => {
  assert.deepStrictEqual(getPlanLimits('business'), PLANS.business);
});

test('getPlanLimits returns free plan limits for unknown plan', () => {
  assert.deepStrictEqual(getPlanLimits('unknown'), PLANS.free);
});

test('getPlanLimits returns free plan limits for empty string', () => {
  assert.deepStrictEqual(getPlanLimits(''), PLANS.free);
});
