import { EmotionEventStrength } from '../../../../proto/ai/inworld/packets/packets.pb';

export enum EmotionStrengthCode {
  UNSPECIFIED = 'UNSPECIFIED',
  WEAK = 'WEAK',
  STRONG = 'STRONG',
  NORMAL = 'NORMAL',
}

export class EmotionStrength {
  readonly code: EmotionStrengthCode;

  constructor(strength: EmotionStrengthCode) {
    this.code = strength;
  }

  static fromProto(code: EmotionEventStrength) {
    switch (code) {
      case EmotionEventStrength.UNSPECIFIED:
        return EmotionStrengthCode.UNSPECIFIED;
      case EmotionEventStrength.WEAK:
        return EmotionStrengthCode.WEAK;
      case EmotionEventStrength.STRONG:
        return EmotionStrengthCode.STRONG;
      case EmotionEventStrength.NORMAL:
        return EmotionStrengthCode.NORMAL;
    }
  }
}
