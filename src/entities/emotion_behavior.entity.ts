import deprecate from 'util-deprecate';

import { EmotionEventSpaffCode } from '../../proto/packets.pb';

export enum EmotionBehaviorCode {
  NEUTRAL = 'NEUTRAL',
  DISGUST = 'DISGUST',
  CONTEMPT = 'CONTEMPT',
  BELLIGERENCE = 'BELLIGERENCE',
  DOMINEERING = 'DOMINEERING',
  CRITICISM = 'CRITICISM',
  ANGER = 'ANGER',
  TENSION = 'TENSION',
  TENSE_HUMOR = 'TENSE_HUMOR',
  DEFENSIVENESS = 'DEFENSIVENESS',
  WHINING = 'WHINING',
  SADNESS = 'SADNESS',
  STONEWALLING = 'STONEWALLING',
  INTEREST = 'INTEREST',
  VALIDATION = 'VALIDATION',
  AFFECTION = 'AFFECTION',
  HUMOR = 'HUMOR',
  SURPRISE = 'SURPRISE',
  JOY = 'JOY',
}

export class EmotionBehavior {
  readonly code: EmotionBehaviorCode;

  constructor(behavior: EmotionBehaviorCode) {
    this.code = behavior;
  }

  isNeutral() {
    return this.code === EmotionBehaviorCode.NEUTRAL;
  }

  isDisgust() {
    return this.code === EmotionBehaviorCode.DISGUST;
  }

  isContempt() {
    return this.code === EmotionBehaviorCode.CONTEMPT;
  }

  isBelligerence() {
    return this.code === EmotionBehaviorCode.BELLIGERENCE;
  }

  isDomineering() {
    return this.code === EmotionBehaviorCode.DOMINEERING;
  }

  isCriticism() {
    return this.code === EmotionBehaviorCode.CRITICISM;
  }

  isAnger() {
    return this.code === EmotionBehaviorCode.ANGER;
  }

  isTension() {
    return this.code === EmotionBehaviorCode.TENSION;
  }

  isTenseHumor() {
    return this.code === EmotionBehaviorCode.TENSE_HUMOR;
  }

  isDefensiveness() {
    return this.code === EmotionBehaviorCode.DEFENSIVENESS;
  }

  isWhining() {
    return this.code === EmotionBehaviorCode.WHINING;
  }

  isSadness() {
    return this.code === EmotionBehaviorCode.SADNESS;
  }

  isStonewalling() {
    return this.code === EmotionBehaviorCode.STONEWALLING;
  }

  isInterest() {
    return this.code === EmotionBehaviorCode.INTEREST;
  }

  isValidation() {
    return this.code === EmotionBehaviorCode.VALIDATION;
  }

  isAffection() {
    return this.code === EmotionBehaviorCode.AFFECTION;
  }

  isHumor() {
    return this.code === EmotionBehaviorCode.HUMOR;
  }

  isSurprise() {
    return this.code === EmotionBehaviorCode.SURPRISE;
  }

  isJoy() {
    return this.code === EmotionBehaviorCode.JOY;
  }

  static fromProto(code: EmotionEventSpaffCode) {
    switch (code) {
      case EmotionEventSpaffCode.NEUTRAL:
        return EmotionBehaviorCode.NEUTRAL;
      case EmotionEventSpaffCode.DISGUST:
        return EmotionBehaviorCode.DISGUST;
      case EmotionEventSpaffCode.CONTEMPT:
        return EmotionBehaviorCode.CONTEMPT;
      case EmotionEventSpaffCode.BELLIGERENCE:
        return EmotionBehaviorCode.BELLIGERENCE;
      case EmotionEventSpaffCode.DOMINEERING:
        return EmotionBehaviorCode.DOMINEERING;
      case EmotionEventSpaffCode.CRITICISM:
        return EmotionBehaviorCode.CRITICISM;
      case EmotionEventSpaffCode.ANGER:
        return EmotionBehaviorCode.ANGER;
      case EmotionEventSpaffCode.TENSION:
        return EmotionBehaviorCode.TENSION;
      case EmotionEventSpaffCode.TENSE_HUMOR:
        return EmotionBehaviorCode.TENSE_HUMOR;
      case EmotionEventSpaffCode.DEFENSIVENESS:
        return EmotionBehaviorCode.DEFENSIVENESS;
      case EmotionEventSpaffCode.WHINING:
        return EmotionBehaviorCode.WHINING;
      case EmotionEventSpaffCode.SADNESS:
        return EmotionBehaviorCode.SADNESS;
      case EmotionEventSpaffCode.STONEWALLING:
        return EmotionBehaviorCode.STONEWALLING;
      case EmotionEventSpaffCode.INTEREST:
        return EmotionBehaviorCode.INTEREST;
      case EmotionEventSpaffCode.VALIDATION:
        return EmotionBehaviorCode.VALIDATION;
      case EmotionEventSpaffCode.AFFECTION:
        return EmotionBehaviorCode.AFFECTION;
      case EmotionEventSpaffCode.HUMOR:
        return EmotionBehaviorCode.HUMOR;
      case EmotionEventSpaffCode.SURPRISE:
        return EmotionBehaviorCode.SURPRISE;
      case EmotionEventSpaffCode.JOY:
        return EmotionBehaviorCode.JOY;
    }
  }
}

EmotionBehavior.prototype.isNeutral = deprecate(
  EmotionBehavior.prototype.isNeutral,
  'isNeutral() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isDisgust = deprecate(
  EmotionBehavior.prototype.isDisgust,
  'isDisgust() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isContempt = deprecate(
  EmotionBehavior.prototype.isContempt,
  'isContempt() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isBelligerence = deprecate(
  EmotionBehavior.prototype.isBelligerence,
  'isBelligerence() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isDomineering = deprecate(
  EmotionBehavior.prototype.isDomineering,
  'isDomineering() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isCriticism = deprecate(
  EmotionBehavior.prototype.isCriticism,
  'isCriticism() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isAnger = deprecate(
  EmotionBehavior.prototype.isAnger,
  'isAnger() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isTension = deprecate(
  EmotionBehavior.prototype.isTension,
  'isTension() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isTenseHumor = deprecate(
  EmotionBehavior.prototype.isTenseHumor,
  'isTenseHumor() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isDefensiveness = deprecate(
  EmotionBehavior.prototype.isDefensiveness,
  'isDefensiveness() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isWhining = deprecate(
  EmotionBehavior.prototype.isWhining,
  'isWhining() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isSadness = deprecate(
  EmotionBehavior.prototype.isSadness,
  'isSadness() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isStonewalling = deprecate(
  EmotionBehavior.prototype.isStonewalling,
  'isStonewalling() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isInterest = deprecate(
  EmotionBehavior.prototype.isInterest,
  'isInterest() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isValidation = deprecate(
  EmotionBehavior.prototype.isValidation,
  'isValidation() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isAffection = deprecate(
  EmotionBehavior.prototype.isAffection,
  'isAffection() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isHumor = deprecate(
  EmotionBehavior.prototype.isHumor,
  'isHumor() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isSurprise = deprecate(
  EmotionBehavior.prototype.isSurprise,
  'isSurprise() is deprecated. Use code property instead.',
);

EmotionBehavior.prototype.isJoy = deprecate(
  EmotionBehavior.prototype.isJoy,
  'isJoy() is deprecated. Use code property instead.',
);
