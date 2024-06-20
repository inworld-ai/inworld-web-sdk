import './App.css';

import {
  AdditionalPhonemeInfo,
  Character,
  EmotionEvent,
  HistoryItem,
  InworldConnectionService,
  InworldPacket,
} from '@inworld/web-core';
import { ArrowBackRounded } from '@mui/icons-material';
import { Box, Button, Grid } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Chat } from './app/chat/Chat';
import { Avatar } from './app/components/3dAvatar/Avatar';
import { CircularRpmAvatar } from './app/components/CircularRpmAvatar';
import ControlBar from './app/components/ControlBar';
import {
  AnimationFiles,
  AnimationSequence,
} from './app/components/innequin/data/animations';
import { Innequin } from './app/components/innequin/Innequin';
import { Layout } from './app/components/Layout';
import {
  ChatWrapper,
  MainWrapper,
  SimulatorHeader,
} from './app/components/Simulator';
import { ConfigView } from './app/configuration/ConfigView';
import { InworldService } from './app/connection';
import {
  get as getConfiguration,
  save as saveConfiguration,
} from './app/helpers/configuration';
import { JSONToPreviousDialog, toInt } from './app/helpers/transform';
import {
  BODY_TEXTURE_TYPE,
  CHAT_VIEW,
  ConfigurationSession,
  EmotionsMap,
} from './app/types';
import { Config } from './config';
import * as defaults from './defaults';

interface CurrentContext {
  characters: Character[];
  chatting: boolean;
  connection?: InworldConnectionService;
}

function App() {
  const formMethods = useForm<ConfigurationSession>({ mode: 'onChange' });

  const [bodyTexture, setBodyTexture] = useState(BODY_TEXTURE_TYPE.WOOD1);
  const [connection, setConnection] = useState<InworldConnectionService>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character>();
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [prevChatHistory, setPrevChatHistory] = useState<HistoryItem[]>([]);
  const [prevTranscripts, setPrevTranscripts] = useState<string[]>([]);
  const [chatting, setChatting] = useState(false);
  const [chatView, setChatView] = useState(CHAT_VIEW.TEXT);
  const [initialized, setInitialized] = useState(false);
  const [phonemes, setPhonemes] = useState<AdditionalPhonemeInfo[]>([]);
  const [emotionEvent, setEmotionEvent] = useState<EmotionEvent>();
  const [avatars, setAvatars] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<EmotionsMap>({});
  const [stopRecording, setStopRecording] = useState<boolean>(false);

  const stateRef = useRef<CurrentContext>();
  stateRef.current = {
    characters,
    chatting,
    connection,
  };

  const afterSceneLoad = async (connection: InworldConnectionService) => {
    const form = formMethods.getValues();
    const characters = await connection.getCharacters();
    const currentCharacter = await connection.getCurrentCharacter();

    if (characters.length) {
      console.log('Characters found:', characters);
      const avatars = characters.map((c: Character) => {
        const rpmImageUri = c?.assets?.rpmImageUriPortrait;
        const avatarImg = c?.assets?.avatarImg;

        return rpmImageUri || avatarImg || '';
      });
      setAvatars(avatars);
    } else {
      console.error(
        'Character(s) not found. Was them added?:',
        form.scene?.name! || form.character?.name!,
      );
      return;
    }

    setCurrentCharacter(currentCharacter);
    setCharacters(characters);
  };

  const onHistoryChange = useCallback((history: HistoryItem[]) => {
    setChatHistory([...prevChatHistory, ...history]);
  }, []);

  const openConnection = useCallback(
    async (previousState?: string) => {
      const form = formMethods.getValues();
      const currentTranscript = connection?.getTranscript() || '';

      setPrevTranscripts([
        ...prevTranscripts,
        ...(currentTranscript ? [currentTranscript] : []),
      ]);
      setPrevChatHistory([...prevChatHistory, ...chatHistory]);
      setChatHistory([]);
      setChatting(true);
      setChatView(form.chatView!);

      const duration = toInt(form.audio.stopDuration ?? 0);
      const ticks = toInt(form.audio.stopTicks ?? 0);
      const previousDialog = form.continuation?.enabled
        ? JSONToPreviousDialog(form.continuation.previousDialog!)
        : [];
      const textMode = [CHAT_VIEW.TEXT, CHAT_VIEW.MULTI_AGENT_TEXT].includes(
        form.chatView!,
      );

      console.log('Connecting to Inworld Service');
      const service = new InworldService({
        onHistoryChange,
        capabilities: {
          ...(textMode ? { interruptions: true } : { phonemes: true }),
          emotions: true,
          debugInfo: true,
          narratedActions: true,
        },
        ...(previousDialog.length && { continuation: { previousDialog } }),
        ...(previousState && { continuation: { previousState } }),
        audioPlayback: {
          ...(duration && ticks && { stop: { duration, ticks } }),
          sampleRate: 22050,
        },
        sceneName:
          form.chatView === CHAT_VIEW.MULTI_AGENT_TEXT
            ? form.scene?.name!
            : form.character?.name!,
        playerName: form.player?.name!,
        onPhoneme: (phonemes: AdditionalPhonemeInfo[]) => {
          setPhonemes(phonemes);
        },
        onReady: async () => {
          console.log('Ready!');
        },
        onDisconnect: () => {
          console.log('Disconnect!');
          setStopRecording(true);
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

          if (inworldPacket.isSceneMutationResponse()) {
            afterSceneLoad(service.connection);
          }
        },
      });

      afterSceneLoad(service.connection);
      setConnection(service.connection);
    },
    [
      chatHistory,
      connection,
      formMethods,
      onHistoryChange,
      prevChatHistory,
      prevTranscripts,
    ],
  );

  const stopChatting = useCallback(async () => {
    // Disable flags
    setChatting(false);

    // Clear collections
    setChatHistory([]);
    setPrevChatHistory([]);

    // Close connection and clear connection data
    connection?.close();
    setConnection(undefined);
    setCharacters([]);
  }, [connection]);

  const resetForm = useCallback(() => {
    formMethods.reset({
      ...defaults.configuration,
    });
    saveConfiguration(formMethods.getValues());
  }, [formMethods]);

  useEffect(() => {
    const configuration = getConfiguration();

    formMethods.reset({
      ...(configuration
        ? (JSON.parse(configuration) as ConfigurationSession)
        : defaults.configuration),
    });

    setInitialized(true);
  }, [formMethods]);

  const content = chatting ? (
    <>
      {characters.length ? (
        <MainWrapper>
          {false && (
            <Box
              sx={{
                borderRadius: '1.75rem',
                backgroundColor: 'white',
                top: '50px',
                width: '9%',
                height: '50%',
              }}
            >
              <ControlBar
                bodyTexture={bodyTexture}
                setBodyTexture={setBodyTexture}
                visible={true}
              />
            </Box>
          )}
          <ChatWrapper>
            {chatView === CHAT_VIEW.AVATAR && (
              <Avatar
                emotionEvent={emotionEvent}
                phonemes={phonemes}
                visible={chatView === CHAT_VIEW.AVATAR}
                url={
                  Config.RPM_AVATAR ||
                  characters[0].assets.rpmModelUri ||
                  defaults.DEFAULT_RPM_AVATAR
                }
              />
            )}
            {chatView === CHAT_VIEW.INNEQUIN && (
              <Innequin
                animationFiles={AnimationFiles}
                animationSequence={AnimationSequence}
                bodyTexture={bodyTexture}
                emotionEvent={emotionEvent}
                phonemes={phonemes}
                visible={chatView === CHAT_VIEW.INNEQUIN}
                modelURI={Config.MODEL_URI}
              />
            )}
            <SimulatorHeader>
              <Grid container>
                <Grid item sm={6}>
                  <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={stopChatting}
                    variant="outlined"
                  >
                    Back to settings
                  </Button>
                </Grid>
                {[CHAT_VIEW.TEXT, CHAT_VIEW.MULTI_AGENT_TEXT].includes(
                  chatView,
                ) && (
                  <Grid item sm={6}>
                    {characters.length &&
                      characters.map((character, index) => (
                        <CircularRpmAvatar
                          key={index}
                          src={avatars[index]}
                          name={character.displayName}
                          size="40px"
                          sx={{
                            display: ['none', 'flex'],
                            mr: 1,
                            float: 'left',
                          }}
                          active={
                            currentCharacter?.resourceName ===
                            character.resourceName
                          }
                          onClick={() => {
                            connection?.setCurrentCharacter(character);
                            setCurrentCharacter(character);
                          }}
                        />
                      ))}
                  </Grid>
                )}
              </Grid>
            </SimulatorHeader>
            <Chat
              characters={characters}
              chatView={chatView}
              chatHistory={chatHistory}
              prevTranscripts={prevTranscripts}
              connection={connection!}
              emotions={emotions}
              onRestore={openConnection}
              stopRecording={stopRecording}
              onStartRecording={() => setStopRecording(false)}
            />
          </ChatWrapper>
        </MainWrapper>
      ) : (
        'Loading...'
      )}
    </>
  ) : (
    <ConfigView
      chatView={formMethods.watch('chatView')}
      canStart={formMethods.formState.isValid}
      onStart={() => openConnection()}
      onResetForm={resetForm}
    />
  );

  return (
    <FormProvider {...formMethods}>
      <Layout>{initialized ? content : ''}</Layout>
    </FormProvider>
  );
}

export default App;
