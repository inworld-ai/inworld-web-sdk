import { EmotionEventSpaffCode } from '../../proto/packets.pb';
import { EmotionBehavior } from '../../src/entities/emotion-behavior.entity';

test('should be neutral', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.NEUTRAL);

  expect(behavior.isNeutral()).toEqual(true);
});

test('should be disgust', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.DISGUST);

  expect(behavior.isDisgust()).toEqual(true);
});

test('should be contempt', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.CONTEMPT);

  expect(behavior.isContempt()).toEqual(true);
});

test('should be belligerence', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.BELLIGERENCE);

  expect(behavior.isBelligerence()).toEqual(true);
});

test('should be domineering', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.DOMINEERING);

  expect(behavior.isDomineering()).toEqual(true);
});

test('should be criticism', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.CRITICISM);

  expect(behavior.isCriticism()).toEqual(true);
});

test('should be anger', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.ANGER);

  expect(behavior.isAnger()).toEqual(true);
});

test('should be tension', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.TENSION);

  expect(behavior.isTension()).toEqual(true);
});

test('should be tense humor', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.TENSE_HUMOR);

  expect(behavior.isTenseHumor()).toEqual(true);
});

test('should be defensiveness', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.DEFENSIVENESS);

  expect(behavior.isDefensiveness()).toEqual(true);
});

test('should be whining', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.WHINING);

  expect(behavior.isWhining()).toEqual(true);
});

test('should be sadness', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.SADNESS);

  expect(behavior.isSadness()).toEqual(true);
});

test('should be stonewalling', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.STONEWALLING);

  expect(behavior.isStonewalling()).toEqual(true);
});

test('should be interest', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.INTEREST);

  expect(behavior.isInterest()).toEqual(true);
});

test('should be validation', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.VALIDATION);

  expect(behavior.isValidation()).toEqual(true);
});

test('should be affection', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.AFFECTION);

  expect(behavior.isAffection()).toEqual(true);
});

test('should be humor', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.HUMOR);

  expect(behavior.isHumor()).toEqual(true);
});

test('should be surprise', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.SURPRISE);

  expect(behavior.isSurprise()).toEqual(true);
});

test('should be joy', () => {
  const behavior = new EmotionBehavior(EmotionEventSpaffCode.JOY);

  expect(behavior.isJoy()).toEqual(true);
});
