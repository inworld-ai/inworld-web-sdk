import { AdditionalPhonemeInfo } from '@inworld/web-core';

import { InnequinPhonemesToVisemesMap } from './InnequinPhonemesToVisemesMap';

const LAST_PHONEME_DURATION = 1;

export const getVisemeData = function (
  offset: number,
  phonemeData: AdditionalPhonemeInfo[],
) {
  // exit condition 1;
  if (!phonemeData[phonemeData.length - 1]) {
    return;
  }

  // exit condition 2;
  // LAST phoneme is always '<INTERSPERSE_CHARACTER>';
  if (phonemeData[phonemeData.length - 1].startOffsetS! < offset) {
    return;
  }

  for (
    let currentIndex = 0;
    currentIndex < phonemeData.length;
    currentIndex++
  ) {
    // iterating though all phonemes, trying to calculate smoothed blendshape;

    const currentOffset = phonemeData[currentIndex].startOffsetS!;
    const nextOffset = phonemeData[currentIndex + 1]
      ? phonemeData[currentIndex + 1].startOffsetS!
      : currentOffset + LAST_PHONEME_DURATION;

    const currentPhoneme = phonemeData[currentIndex].phoneme;

    if (!currentPhoneme) {
      continue;
    }

    const currentViseme = InnequinPhonemesToVisemesMap[currentPhoneme] ?? -1;

    if (offset > currentOffset && offset < nextOffset) {
      return currentViseme;
    }

    if (currentIndex === phonemeData.length) {
      return 0;
    }
  }

  return -1;
};
