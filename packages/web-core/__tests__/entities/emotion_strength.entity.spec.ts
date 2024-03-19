import { EmotionEventStrength } from '../../proto/ai/inworld/packets/packets.pb';
import {
  EmotionStrength,
  EmotionStrengthCode,
} from '../../src/entities/packets/emotion/emotion_strength.entity';

const mappingTestTable = [
  {
    input: EmotionEventStrength.WEAK,
    expected: EmotionStrengthCode.WEAK,
  },
  {
    input: EmotionEventStrength.STRONG,
    expected: EmotionStrengthCode.STRONG,
  },
  {
    input: EmotionEventStrength.NORMAL,
    expected: EmotionStrengthCode.NORMAL,
  },
  {
    input: EmotionEventStrength.UNSPECIFIED,
    expected: EmotionStrengthCode.UNSPECIFIED,
  },
];

test('should be weak', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.WEAK);

  expect(strength.code).toEqual(EmotionStrengthCode.WEAK);
});

test('should be disgust', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.STRONG);

  expect(strength.code).toEqual(EmotionStrengthCode.STRONG);
});

test('should be normal', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.NORMAL);

  expect(strength.code).toEqual(EmotionStrengthCode.NORMAL);
});

test('should be unspecified', () => {
  const strength = new EmotionStrength(EmotionStrengthCode.UNSPECIFIED);

  expect(strength.code).toEqual(EmotionStrengthCode.UNSPECIFIED);
});

test.each(mappingTestTable)(
  'should correctly convert $input',
  ({ input, expected }) => {
    expect(EmotionStrength.fromProto(input)).toEqual(expected);
  },
);
