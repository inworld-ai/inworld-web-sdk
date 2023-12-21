import { InnequinBehaviorToBody } from './innequin/animator/utils/InnequinBehaviorToBody';
import { InnequinBehaviorToFacial } from './innequin/animator/utils/InnequinBehaviorToFacial';
import { Innequin, InnequinProps } from './innequin/Innequin';
import { InnequinConfiguration } from './innequin/InnequinConfiguration';
import { RPMBehaviorToFacial } from './rpm/animator/utils/RPMBehaviorToFacial';
import { RPMFacialEmotionMap } from './rpm/animator/utils/RPMFacialEmotionMap';
import { RPM, RPMProps } from './rpm/RPM';
import { RPMConfiguration } from './rpm/RPMConfiguration';
import { SkinType } from './types/types';

export {
  Innequin,
  InnequinBehaviorToBody,
  InnequinBehaviorToFacial,
  RPM,
  RPMBehaviorToFacial,
  RPMFacialEmotionMap,
};
export type {
  InnequinConfiguration,
  InnequinProps,
  RPMConfiguration,
  RPMProps,
  SkinType,
};
