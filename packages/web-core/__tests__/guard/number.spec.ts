import { isNaturalNumber } from '../../src/guard/number';

test('should return true for natural number', () => {
  expect(isNaturalNumber(1)).toEqual(true);
});

test('should return false for negative number', () => {
  expect(isNaturalNumber(-1)).toEqual(false);
});

test('should return false for decimal number', () => {
  expect(isNaturalNumber(1.1)).toEqual(false);
});
