import deprecate from 'util-deprecate';

import { EmotionEventStrength } from '../../proto/packets.pb';

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

  isWeak() {
    return this.code === EmotionStrengthCode.WEAK;
  }

  isStrong() {
    return this.code === EmotionStrengthCode.STRONG;
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

EmotionStrength.prototype.isWeak = deprecate(
  EmotionStrength.prototype.isWeak,
  'isWeak() is deprecated. Use code property instead.',
);

EmotionStrength.prototype.isStrong = deprecate(
  EmotionStrength.prototype.isStrong,
  'isStrong() is deprecated. Use code property instead.',
);
