import { EmotionEventSpaffCode } from '../../../../proto/ai/inworld/packets/packets.pb';

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
