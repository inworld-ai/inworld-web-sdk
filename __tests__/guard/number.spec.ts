import { isNaturalNumber } from '../../src/guard/number';

test('should return true for natural number', () => {
  expect(isNaturalNumber(1)).toEqual(true);
});

test('should return false for not natural number', () => {
  expect(isNaturalNumber(-1)).toEqual(false);
});

test('should return false for undefined', () => {
  expect(isNaturalNumber(undefined)).toEqual(false);
});
