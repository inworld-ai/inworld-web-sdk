import { AnimationFile, ANIMATION_TYPE, EMOTIONS } from '../app/types';

export const AnimationFiles: AnimationFile[] = [
    { name: 'Angry_Idle', emotion: EMOTIONS.ANGRY, type: ANIMATION_TYPE.IDLE, file: 'inniquin_angry_idle.glb' },
    { name: 'Angry_Intro_01', emotion: EMOTIONS.ANGRY, type: ANIMATION_TYPE.INTRO, file: 'inniquin_angry_intro_01.glb' },
    { name: 'Angry_Outro_01', emotion: EMOTIONS.ANGRY, type: ANIMATION_TYPE.OUTRO, file: 'inniquin_angry_outro_01.glb' },
    { name: 'Happy_Idle_01', emotion: EMOTIONS.HAPPY, type: ANIMATION_TYPE.IDLE, file: 'inniquin_happy_idle_01.glb' },
    { name: 'Happy_Intro_01', emotion: EMOTIONS.HAPPY, type: ANIMATION_TYPE.INTRO, file: 'inniquin_happy_intro_01.glb' },
    { name: 'Happy_Outro_01', emotion: EMOTIONS.HAPPY, type: ANIMATION_TYPE.OUTRO, file: 'inniquin_happy_outro_01.glb' },
    { name: 'Neutral_Idle', emotion: EMOTIONS.NEUTRAL, type: ANIMATION_TYPE.IDLE, file: 'inniquin_neutral_idle.glb' },
    { name: 'Neutral_Hello_Long_01', emotion: EMOTIONS.NEUTRAL, type: ANIMATION_TYPE.HELLO, file: 'inniquin_neutral_hello_long_01.glb' },
    { name: 'Neutral_Hello_Short_01', emotion: EMOTIONS.NEUTRAL, type: ANIMATION_TYPE.HELLO, file: 'inniquin_neutral_hello_short_01.glb' },
    { name: 'Neutral_Hello_Short_02', emotion: EMOTIONS.NEUTRAL, type: ANIMATION_TYPE.HELLO, file: 'inniquin_neutral_hello_short_02.glb' },
    { name: 'Sad_Idle', emotion: EMOTIONS.SAD, type: ANIMATION_TYPE.IDLE, file: 'inniquin_sad_idle.glb' },
    { name: 'Sad_Intro_01', emotion: EMOTIONS.SAD, type: ANIMATION_TYPE.INTRO, file: 'inniquin_sad_intro_01.glb' },
    { name: 'Sad_Outro_01', emotion: EMOTIONS.SAD, type: ANIMATION_TYPE.OUTRO, file: 'inniquin_sad_outro_01.glb' },
]

export const AnimationSequence: string[] = [
    'Neutral_Hello_Long_01',
    'Neutral_Idle',
    'Angry_Intro_01',
    'Angry_Idle',
    'Angry_Outro_01',
    'Neutral_Idle',
    'Happy_Intro_01',
    'Happy_Idle_01',
    'Happy_Outro_01',
    'Neutral_Idle',
    'Sad_Intro_01',
    'Sad_Idle',
    'Sad_Outro_01'
];