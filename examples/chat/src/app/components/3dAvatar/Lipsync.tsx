/* eslint-disable */
import { AdditionalPhonemeInfo } from '@inworld/web-core';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useState } from 'react';
import { Group, Mesh, SkinnedMesh } from 'three';

import { getVisemeData } from './PhonemDataToVisemeDataConverter';

interface LipSyncProps {
  modelRef: React.MutableRefObject<Group>;
  phonemeRef: React.MutableRefObject<AdditionalPhonemeInfo[]>;
}

// those variables needed for immediate realtime animation playback.
// won't work with any sort of react useState as it is not immediate / realtime.
let visemeOffsetS = 0;
let phonemeData: AdditionalPhonemeInfo[] = [];

const VISEMES_AMOUNT = 15;
const VISEME_SIL_USERDATA_NAME = 'viseme_sil';

export function LipSync(props: LipSyncProps) {
  const [skinnedMesh, setSknnedMesh] = useState<SkinnedMesh | null>(null);
  const [startingIndex, setStartingIndex] = useState(-1);

  useEffect(() => {
    let modelData = props.modelRef.current;
    if (modelData) {
      modelData.traverse((child) => {
        if (child instanceof Mesh) {
          if (child.name === 'Wolf3D_Avatar') {
            // const mesh = modelData.children[0].children[0] as SkinnedMesh;
            setSknnedMesh(child as SkinnedMesh);
            // iterate through blendshape names in order to find the beginning of the
            // viseme sequence (viseme_sil + 14 next)
            for (let i = 0; i < child.userData.targetNames.length; i++) {
              if (child.userData.targetNames[i] === VISEME_SIL_USERDATA_NAME) {
                setStartingIndex(i);
                break;
              }
            }
          }
        }
      });
    }
  }, [props.modelRef.current]);

  useFrame((state, delta) => {
    phonemeData = props.phonemeRef.current;
    if (phonemeData.length && startingIndex != -1) {
      visemeOffsetS += delta;
      const data = getVisemeData(visemeOffsetS, phonemeData);

      if (!data) {
        visemeOffsetS = 0;
        props.phonemeRef.current = [];
        return;
      }
      for (let i = 0; i < VISEMES_AMOUNT; i++) {
        skinnedMesh!.morphTargetInfluences![startingIndex + i] = data[i];
      }
    } else {
      if (skinnedMesh) {
        skinnedMesh!.morphTargetInfluences![startingIndex] = 1; // then every other morph would be cancelled.
        for (let i = 1; i < VISEMES_AMOUNT; i++) {
          skinnedMesh!.morphTargetInfluences![startingIndex + i] = 0;
        }
      }
    }
  });

  return <></>;
}
