import { EmotionEventStrength } from '../../proto/packets.pb';

export class EmotionStrength {
  private strength: EmotionEventStrength;

  constructor(strength: EmotionEventStrength) {
    this.strength = strength;
  }

  isWeak() {
    return this.strength === EmotionEventStrength.WEAK;
  }

  isStrong() {
    return this.strength === EmotionEventStrength.STRONG;
  }
}
