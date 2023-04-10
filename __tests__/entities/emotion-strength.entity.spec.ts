import { EmotionEventStrength } from '../../proto/packets.pb';
import { EmotionStrength } from '../../src/entities/emotion-strength.entity';

test('should be weak', () => {
  const strength = new EmotionStrength(EmotionEventStrength.WEAK);

  expect(strength.isWeak()).toEqual(true);
});

test('should be disgust', () => {
  const behavior = new EmotionStrength(EmotionEventStrength.STRONG);

  expect(behavior.isStrong()).toEqual(true);
});
