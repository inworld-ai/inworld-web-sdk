import { EmotionEventSpaffCode } from '../../proto/packets.pb';
import {
  EmotionBehavior,
  EmotionBehaviorCode,
} from '../../src/entities/emotion-behavior.entity';

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

describe('from proto', () => {
  test('should convert neutral', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.NEUTRAL)).toEqual(
      EmotionBehaviorCode.NEUTRAL,
    );
  });

  test('should convert disgust', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.DISGUST)).toEqual(
      EmotionBehaviorCode.DISGUST,
    );
  });

  test('should convert contempt', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.CONTEMPT)).toEqual(
      EmotionBehaviorCode.CONTEMPT,
    );
  });

  test('should convert belligerence', () => {
    expect(
      EmotionBehavior.fromProto(EmotionEventSpaffCode.BELLIGERENCE),
    ).toEqual(EmotionBehaviorCode.BELLIGERENCE);
  });

  test('should convert domineering', () => {
    expect(
      EmotionBehavior.fromProto(EmotionEventSpaffCode.DOMINEERING),
    ).toEqual(EmotionBehaviorCode.DOMINEERING);
  });

  test('should convert criticism', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.CRITICISM)).toEqual(
      EmotionBehaviorCode.CRITICISM,
    );
  });

  test('should convert anger', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.ANGER)).toEqual(
      EmotionBehaviorCode.ANGER,
    );
  });

  test('should convert tension', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.TENSION)).toEqual(
      EmotionBehaviorCode.TENSION,
    );
  });

  test('should convert tense humor', () => {
    expect(
      EmotionBehavior.fromProto(EmotionEventSpaffCode.TENSE_HUMOR),
    ).toEqual(EmotionBehaviorCode.TENSE_HUMOR);
  });

  test('should convert defensiveness', () => {
    expect(
      EmotionBehavior.fromProto(EmotionEventSpaffCode.DEFENSIVENESS),
    ).toEqual(EmotionBehaviorCode.DEFENSIVENESS);
  });

  test('should convert whining', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.WHINING)).toEqual(
      EmotionBehaviorCode.WHINING,
    );
  });

  test('should convert sadness', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.SADNESS)).toEqual(
      EmotionBehaviorCode.SADNESS,
    );
  });

  test('should convert stonewalling', () => {
    expect(
      EmotionBehavior.fromProto(EmotionEventSpaffCode.STONEWALLING),
    ).toEqual(EmotionBehaviorCode.STONEWALLING);
  });

  test('should convert interest', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.INTEREST)).toEqual(
      EmotionBehaviorCode.INTEREST,
    );
  });

  test('should convert validation', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.VALIDATION)).toEqual(
      EmotionBehaviorCode.VALIDATION,
    );
  });

  test('should convert affection', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.AFFECTION)).toEqual(
      EmotionBehaviorCode.AFFECTION,
    );
  });

  test('should convert humor', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.HUMOR)).toEqual(
      EmotionBehaviorCode.HUMOR,
    );
  });

  test('should convert surprise', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.SURPRISE)).toEqual(
      EmotionBehaviorCode.SURPRISE,
    );
  });

  test('should convert joy', () => {
    expect(EmotionBehavior.fromProto(EmotionEventSpaffCode.JOY)).toEqual(
      EmotionBehaviorCode.JOY,
    );
  });
});
