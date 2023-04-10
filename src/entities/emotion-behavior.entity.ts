import { EmotionEventSpaffCode } from '../../proto/packets.pb';

export class EmotionBehavior {
  private behavior: EmotionEventSpaffCode;

  constructor(behavior: EmotionEventSpaffCode) {
    this.behavior = behavior;
  }

  isNeutral() {
    return this.behavior === EmotionEventSpaffCode.NEUTRAL;
  }

  isDisgust() {
    return this.behavior === EmotionEventSpaffCode.DISGUST;
  }

  isContempt() {
    return this.behavior === EmotionEventSpaffCode.CONTEMPT;
  }

  isBelligerence() {
    return this.behavior === EmotionEventSpaffCode.BELLIGERENCE;
  }

  isDomineering() {
    return this.behavior === EmotionEventSpaffCode.DOMINEERING;
  }

  isCriticism() {
    return this.behavior === EmotionEventSpaffCode.CRITICISM;
  }

  isAnger() {
    return this.behavior === EmotionEventSpaffCode.ANGER;
  }

  isTension() {
    return this.behavior === EmotionEventSpaffCode.TENSION;
  }

  isTenseHumor() {
    return this.behavior === EmotionEventSpaffCode.TENSE_HUMOR;
  }

  isDefensiveness() {
    return this.behavior === EmotionEventSpaffCode.DEFENSIVENESS;
  }

  isWhining() {
    return this.behavior === EmotionEventSpaffCode.WHINING;
  }

  isSadness() {
    return this.behavior === EmotionEventSpaffCode.SADNESS;
  }

  isStonewalling() {
    return this.behavior === EmotionEventSpaffCode.STONEWALLING;
  }

  isInterest() {
    return this.behavior === EmotionEventSpaffCode.INTEREST;
  }

  isValidation() {
    return this.behavior === EmotionEventSpaffCode.VALIDATION;
  }

  isAffection() {
    return this.behavior === EmotionEventSpaffCode.AFFECTION;
  }

  isHumor() {
    return this.behavior === EmotionEventSpaffCode.HUMOR;
  }

  isSurprise() {
    return this.behavior === EmotionEventSpaffCode.SURPRISE;
  }

  isJoy() {
    return this.behavior === EmotionEventSpaffCode.JOY;
  }
}
