import { interpolate, isIOSMobile } from '../../src/common/helpers';
import { setNavigatorProperty } from '../helpers';

describe('interpolate', () => {
  test('should return 1', () => {
    expect(interpolate(1)).toEqual(1);
  });

  test('should return 0', () => {
    expect(interpolate(0)).toEqual(0);
  });
});

describe('isIOSMobile', () => {
  beforeEach(() => {
    setNavigatorProperty('userAgent', '');
  });

  afterEach(() => {
    setNavigatorProperty('userAgent', '');
  });

  test('should return true for iPhone', () => {
    setNavigatorProperty('userAgent', 'iPhone');

    expect(isIOSMobile()).toEqual(true);
  });

  test('should return true for iPad', () => {
    setNavigatorProperty('userAgent', 'iPad');

    expect(isIOSMobile()).toEqual(true);
  });

  test('should return true for iPod', () => {
    setNavigatorProperty('userAgent', 'iPod');

    expect(isIOSMobile()).toEqual(true);
  });

  test('should return false for empty userAgent', () => {
    expect(isIOSMobile()).toEqual(false);
  });

  test('should return false for Android', () => {
    setNavigatorProperty('userAgent', 'Android');

    expect(isIOSMobile()).toEqual(false);
  });
});
