import { EmotionEventStrength } from '../../proto/packets.pb';
import {
  EmotionStrength,
  EmotionStrengthCode,
} from '../../src/entities/emotion-strength.entity';

test('should be weak', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.WEAK);

  expect(strength.code).toEqual(EmotionStrengthCode.WEAK);
  expect(strength.isWeak()).toEqual(true);
});

test('should be disgust', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.STRONG);

  expect(strength.code).toEqual(EmotionStrengthCode.STRONG);
  expect(strength.isStrong()).toEqual(true);
});

test('should be normal', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.NORMAL);

  expect(strength.code).toEqual(EmotionStrengthCode.NORMAL);
});

test('should be unspecified', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.UNSPECIFIED);

  expect(strength.code).toEqual(EmotionStrengthCode.UNSPECIFIED);
});

describe('from proto', () => {
  test('should convert weak', () => {
    expect(EmotionStrength.fromProto(EmotionEventStrength.WEAK)).toEqual(
      EmotionStrengthCode.WEAK,
    );
  });

  test('should convert strong', () => {
    expect(EmotionStrength.fromProto(EmotionEventStrength.STRONG)).toEqual(
      EmotionStrengthCode.STRONG,
    );
  });

  test('should convert normal', () => {
    expect(EmotionStrength.fromProto(EmotionEventStrength.NORMAL)).toEqual(
      EmotionStrengthCode.NORMAL,
    );
  });

  test('should convert unspecified', () => {
    expect(EmotionStrength.fromProto(EmotionEventStrength.UNSPECIFIED)).toEqual(
      EmotionStrengthCode.UNSPECIFIED,
    );
  });
});
