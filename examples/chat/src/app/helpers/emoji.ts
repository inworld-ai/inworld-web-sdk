import { EmotionBehavior } from '@inworld/web-sdk';

function findMapping(behavior: EmotionBehavior): string[] | null {
  switch (true) {
    case behavior.isAffection():
      return ['🥰', '😊', '😘', '😍', '🤗'];
    case behavior.isAnger():
      return ['😤', '😠', '😡', '🤬'];
    case behavior.isBelligerence():
      return ['😡'];
    case behavior.isContempt():
      return ['😠'];
    case behavior.isCriticism():
      return ['👎'];
    case behavior.isDefensiveness():
      return ['✋'];
    case behavior.isDisgust():
      return ['🤢', '🤮', '😖'];
    case behavior.isDomineering():
      return ['😠'];
    case behavior.isHumor():
      return ['😆 ', '😅', '😂', '🤣'];
    case behavior.isInterest():
      return ['🧐', '🤔', '🤨'];
    case behavior.isJoy():
      return ['😀', '😃', '😄', '😁', '😆'];
    case behavior.isSadness():
      return ['😞', '😔', '😟', '😕', '🙁'];
    case behavior.isStonewalling():
      return ['🤐', '😶', '🤫'];
    case behavior.isSurprise():
      return ['😲', '😮', '😧', '😳', '🤯'];
    case behavior.isTenseHumor():
      return ['😬'];
    case behavior.isTension():
      return ['😬', '😰'];
    case behavior.isValidation():
      return ['👍', '👌'];
    case behavior.isWhining():
      return ['😩', '🥺', '😢', '😭', '😮‍💨'];
    default:
      return null;
  }
}

export function getEmoji(behavior: EmotionBehavior): string | null {
  const emoji = findMapping(behavior);

  if (!emoji?.length) return null;

  return emoji.length < 2
    ? emoji[0]
    : emoji[Math.floor(Math.random() * emoji.length)];
}
