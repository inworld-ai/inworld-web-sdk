import { EmotionEventSpaffCode } from '../../proto/packets.pb';
import {
  EmotionBehavior,
  EmotionBehaviorCode,
} from '../../src/entities/emotion-behavior.entity';

const mappingTestTable = [
  {
    input: EmotionEventSpaffCode.NEUTRAL,
    expected: EmotionBehaviorCode.NEUTRAL,
  },
  {
    input: EmotionEventSpaffCode.DISGUST,
    expected: EmotionBehaviorCode.DISGUST,
  },
  {
    input: EmotionEventSpaffCode.CONTEMPT,
    expected: EmotionBehaviorCode.CONTEMPT,
  },
  {
    input: EmotionEventSpaffCode.BELLIGERENCE,
    expected: EmotionBehaviorCode.BELLIGERENCE,
  },
  {
    input: EmotionEventSpaffCode.DOMINEERING,
    expected: EmotionBehaviorCode.DOMINEERING,
  },
  {
    input: EmotionEventSpaffCode.CRITICISM,
    expected: EmotionBehaviorCode.CRITICISM,
  },
  {
    input: EmotionEventSpaffCode.ANGER,
    expected: EmotionBehaviorCode.ANGER,
  },
  {
    input: EmotionEventSpaffCode.TENSION,
    expected: EmotionBehaviorCode.TENSION,
  },
  {
    input: EmotionEventSpaffCode.TENSE_HUMOR,
    expected: EmotionBehaviorCode.TENSE_HUMOR,
  },
  {
    input: EmotionEventSpaffCode.DEFENSIVENESS,
    expected: EmotionBehaviorCode.DEFENSIVENESS,
  },
  {
    input: EmotionEventSpaffCode.WHINING,
    expected: EmotionBehaviorCode.WHINING,
  },
  {
    input: EmotionEventSpaffCode.SADNESS,
    expected: EmotionBehaviorCode.SADNESS,
  },
  {
    input: EmotionEventSpaffCode.STONEWALLING,
    expected: EmotionBehaviorCode.STONEWALLING,
  },
  {
    input: EmotionEventSpaffCode.INTEREST,
    expected: EmotionBehaviorCode.INTEREST,
  },
  {
    input: EmotionEventSpaffCode.VALIDATION,
    expected: EmotionBehaviorCode.VALIDATION,
  },
  {
    input: EmotionEventSpaffCode.AFFECTION,
    expected: EmotionBehaviorCode.AFFECTION,
  },
  {
    input: EmotionEventSpaffCode.HUMOR,
    expected: EmotionBehaviorCode.HUMOR,
  },
  {
    input: EmotionEventSpaffCode.SURPRISE,
    expected: EmotionBehaviorCode.SURPRISE,
  },
  {
    input: EmotionEventSpaffCode.JOY,
    expected: EmotionBehaviorCode.JOY,
  },
];

test('should be neutral', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.NEUTRAL);

  expect(behavior.code).toEqual(EmotionBehaviorCode.NEUTRAL);
  expect(behavior.isNeutral()).toEqual(true);
});

test('should be disgust', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.DISGUST);

  expect(behavior.code).toEqual(EmotionBehaviorCode.DISGUST);
  expect(behavior.isDisgust()).toEqual(true);
});

test('should be contempt', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.CONTEMPT);

  expect(behavior.code).toEqual(EmotionBehaviorCode.CONTEMPT);
  expect(behavior.isContempt()).toEqual(true);
});

test('should be belligerence', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.BELLIGERENCE);

  expect(behavior.code).toEqual(EmotionBehaviorCode.BELLIGERENCE);
  expect(behavior.isBelligerence()).toEqual(true);
});

test('should be domineering', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.DOMINEERING);

  expect(behavior.code).toEqual(EmotionBehaviorCode.DOMINEERING);
  expect(behavior.isDomineering()).toEqual(true);
});

test('should be criticism', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.CRITICISM);

  expect(behavior.code).toEqual(EmotionBehaviorCode.CRITICISM);
  expect(behavior.isCriticism()).toEqual(true);
});

test('should be anger', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.ANGER);

  expect(behavior.code).toEqual(EmotionBehaviorCode.ANGER);
  expect(behavior.isAnger()).toEqual(true);
});

test('should be tension', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.TENSION);

  expect(behavior.code).toEqual(EmotionBehaviorCode.TENSION);
  expect(behavior.isTension()).toEqual(true);
});

test('should be tense humor', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.TENSE_HUMOR);

  expect(behavior.code).toEqual(EmotionBehaviorCode.TENSE_HUMOR);
  expect(behavior.isTenseHumor()).toEqual(true);
});

test('should be defensiveness', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.DEFENSIVENESS);

  expect(behavior.code).toEqual(EmotionBehaviorCode.DEFENSIVENESS);
  expect(behavior.isDefensiveness()).toEqual(true);
});

test('should be whining', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.WHINING);

  expect(behavior.code).toEqual(EmotionBehaviorCode.WHINING);
  expect(behavior.isWhining()).toEqual(true);
});

test('should be sadness', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.SADNESS);

  expect(behavior.code).toEqual(EmotionBehaviorCode.SADNESS);
  expect(behavior.isSadness()).toEqual(true);
});

test('should be stonewalling', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.STONEWALLING);

  expect(behavior.code).toEqual(EmotionBehaviorCode.STONEWALLING);
  expect(behavior.isStonewalling()).toEqual(true);
});

test('should be interest', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.INTEREST);

  expect(behavior.code).toEqual(EmotionBehaviorCode.INTEREST);
  expect(behavior.isInterest()).toEqual(true);
});

test('should be validation', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.VALIDATION);

  expect(behavior.code).toEqual(EmotionBehaviorCode.VALIDATION);
  expect(behavior.isValidation()).toEqual(true);
});

test('should be affection', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.AFFECTION);

  expect(behavior.code).toEqual(EmotionBehaviorCode.AFFECTION);
  expect(behavior.isAffection()).toEqual(true);
});

test('should be humor', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.HUMOR);

  expect(behavior.code).toEqual(EmotionBehaviorCode.HUMOR);
  expect(behavior.isHumor()).toEqual(true);
});

test('should be surprise', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.SURPRISE);

  expect(behavior.code).toEqual(EmotionBehaviorCode.SURPRISE);
  expect(behavior.isSurprise()).toEqual(true);
});

test('should be joy', () => {
  const behavior = new EmotionBehavior(EmotionBehaviorCode.JOY);

  expect(behavior.code).toEqual(EmotionBehaviorCode.JOY);
  expect(behavior.isJoy()).toEqual(true);
});

test.each(mappingTestTable)(
  'should correctly convert $input',
  ({ input, expected }) => {
    expect(EmotionBehavior.fromProto(input)).toEqual(expected);
  },
);
