import {
  AdditionalPhonemeInfo,
  Character,
  EmotionEvent,
  HistoryItem,
  InworldConnectionService,
  InworldPacket,
} from '@inworld/web-core';
import { createContext, useCallback, useContext, useState } from 'react';

import { InworldService } from '../inworld/InworldService';
import { EmotionsMap } from '../types/types';
import { config } from '../utils/config';

export const STATE_ERROR: string = 'state_error';
export const STATE_INIT: string = 'state_init';
export const STATE_OPENING: string = 'state_opening';
export const STATE_OPEN: string = 'state_open';
export const STATE_READY: string = 'state_ready';

interface InworldContextValues {
  close: () => void;
  character: Character | undefined;
  characters: Character[];
  chatHistory: HistoryItem[];
  chatting: boolean;
  connection: InworldConnectionService | undefined;
  emotions: EmotionsMap | undefined;
  emotionEvent: EmotionEvent | undefined;
  isRecording: boolean;
  open: (previousState?: string) => void;
  phonemes: AdditionalPhonemeInfo[];
  prevChatHistory: HistoryItem[];
  // TODO prevTranscripts: string[];
  sendText: (text: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  state: string;
}

const InworldContext = createContext<InworldContextValues>({
  close: () => {},
  character: undefined,
  characters: [],
  chatHistory: [],
  chatting: false,
  connection: undefined,
  emotions: undefined,
  emotionEvent: undefined,
  isRecording: false,
  open: () => {},
  phonemes: [],
  prevChatHistory: [],
  // prevTranscripts: [],
  sendText: () => {},
  startRecording: () => {},
  stopRecording: () => {},
  state: STATE_INIT,
});

const useInworld = () => useContext(InworldContext);

function InworldProvider({ children }: any) {
  const [connection, setConnection] = useState<
    InworldConnectionService | undefined
  >(undefined!);
  const [character, setCharacter] = useState<Character | undefined>(undefined!);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [chatting, setChatting] = useState(false);
  const [emotions, setEmotions] = useState<EmotionsMap>({});
  const [emotionEvent, setEmotionEvent] = useState<EmotionEvent>();
  const [hasPlayedWorkaroundSound, setHasPlayedWorkaroundSound] =
    useState(false);
  const [phonemes, setPhonemes] = useState<AdditionalPhonemeInfo[]>([]);
  const [prevChatHistory, setPrevChatHistory] = useState<HistoryItem[]>([]);
  // TODO Add example
  // const [prevTranscripts, setPrevTranscripts] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [state, setState] = useState<string>(STATE_INIT);

  const onHistoryChange = useCallback((history: HistoryItem[]) => {
    setChatHistory(history);
  }, []);

  const close = useCallback(async () => {
    // Disable flags
    setChatting(false);

    // Stop audio playing and capturing
    connection?.player?.stop();
    connection?.player?.clear();
    connection?.recorder?.stop();

    // Clear collections
    setChatHistory([]);
    setPrevChatHistory([]);

    // Close connection and clear connection data
    connection?.close();
    setConnection(undefined);
    setCharacter(undefined);
    setCharacters([]);

    setState(STATE_READY);
  }, [connection]);

  const open = useCallback(async () => {
    // previousState?: string
    setState(STATE_OPENING);
    //   TODO Add duration and previous state
    //   const currentTranscript = connection?.getTranscript() || '';
    //   setPrevTranscripts([
    //     ...prevTranscripts,
    //     ...(currentTranscript ? [currentTranscript] : []),
    //   ]);
    //   setPrevChatHistory([...prevChatHistory, ...chatHistory]);
    setChatHistory([]);
    setChatting(true);

    //   TODO Add duration and previous state
    //   const duration = toInt(form.audio.stopDuration ?? 0);
    //   const ticks = toInt(form.audio.stopTicks ?? 0);
    //   const previousDialog = form.continuation?.enabled
    //     ? JSONToPreviousDialog(form.continuation.previousDialog!)
    //     : [];

    const service = new InworldService({
      onHistoryChange,
      capabilities: {
        phonemes: true,
        interruptions: true,
        emotions: true,
        narratedActions: true,
      },
      //    TODO Add duration and previous state
      // ...(previousDialog.length && { continuation: { previousDialog } }),
      // ...(previousState && { continuation: { previousState } }),
      // ...(duration &&
      //   ticks && {
      //     audioPlayback: {
      //       stop: { duration, ticks },
      //     },
      //   }),
      sceneName: config.inworld.sceneId,
      playerName: 'Friend',
      onPhoneme: (phonemes: AdditionalPhonemeInfo[]) => {
        setPhonemes(phonemes);
      },
      onReady: async () => {
        console.log('Ready!');
        setState(STATE_OPEN);
      },
      onDisconnect: () => {
        console.log('Disconnect!');
      },
      onMessage: (inworldPacket: InworldPacket) => {
        if (
          inworldPacket.isEmotion() &&
          inworldPacket.packetId?.interactionId
        ) {
          setEmotionEvent(inworldPacket.emotions);
          setEmotions((currentState) => ({
            ...currentState,
            [inworldPacket.packetId.interactionId]: inworldPacket.emotions,
          }));
        }
      },
    });
    console.log('InworldProvider - Opening Connection');
    const characters = await service.connection.getCharacters();
    const character = characters.find(
      (c: Character) => c.resourceName === config.inworld.characterId,
    );

    console.log('InworldProvider - Getting Scene Characters');
    if (character) {
      service.connection.setCurrentCharacter(character);
    }

    setConnection(service.connection);
    setCharacter(character);
    setCharacters(characters);
    console.log('InworldProvider - Connected');
    setState(STATE_OPEN);
  }, [
    chatHistory,
    connection,
    onHistoryChange,
    prevChatHistory,
    // TODO prevTranscripts,
  ]);

  const playWorkaroundSound = useCallback(() => {
    // Workaround for browsers with restrictive auto-play policies
    if (connection) {
      connection?.player.playWorkaroundSound();
      setHasPlayedWorkaroundSound(true);
    }
  }, [connection, setHasPlayedWorkaroundSound]);

  const sendText = useCallback(
    (text: string) => {
      if (text && connection) {
        !hasPlayedWorkaroundSound && playWorkaroundSound();
        connection.sendText(text);
      } else {
        throw new Error(
          'Innequin - Error text sent before connection was open.',
        );
      }
    },
    [connection, hasPlayedWorkaroundSound, playWorkaroundSound],
  );

  const startRecording = useCallback(async () => {
    try {
      if (connection && !isRecording) {
        setIsRecording(true);
        connection.sendAudioSessionStart();
        await connection.recorder.start();
      }
    } catch (e) {
      console.error(e);
    }
  }, [connection, isRecording]);

  const stopRecording = useCallback(() => {
    if (connection && isRecording) {
      connection.recorder.stop();
      connection.sendAudioSessionEnd();
      setIsRecording(false);
    }
  }, [connection, isRecording]);

  return (
    <InworldContext.Provider
      value={{
        chatting,
        character,
        characters,
        chatHistory,
        close,
        connection,
        emotions,
        emotionEvent,
        isRecording,
        open,
        phonemes,
        prevChatHistory,
        // TODO prevTranscripts,
        sendText,
        startRecording,
        stopRecording,
        state,
      }}
    >
      {children}
    </InworldContext.Provider>
  );
}

export { InworldProvider, useInworld };
