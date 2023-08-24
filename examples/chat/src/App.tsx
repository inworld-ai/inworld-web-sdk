import './App.css';

import {
  AdditionalPhonemeInfo,
  Character,
  EmotionEvent,
  HistoryItem,
  InworldConnectionService,
  InworldPacket,
} from '@inworld/web-sdk';
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
import { toInt } from './app/helpers/transform';
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
  const [character, setCharacter] = useState<Character>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [chatting, setChatting] = useState(false);
  const [chatView, setChatView] = useState(CHAT_VIEW.TEXT);
  const [initialized, setInitialized] = useState(false);
  const [phonemes, setPhonemes] = useState<AdditionalPhonemeInfo[]>([]);
  const [emotionEvent, setEmotionEvent] = useState<EmotionEvent>();
  const [avatar, setAvatar] = useState('');
  const [emotions, setEmotions] = useState<EmotionsMap>({});

  const stateRef = useRef<CurrentContext>();
  stateRef.current = {
    characters,
    chatting,
    connection,
  };

  const onHistoryChange = useCallback((history: HistoryItem[]) => {
    setChatHistory(history);
  }, []);

  const openConnection = useCallback(
    async (previousState?: Uint8Array) => {
      const form = formMethods.getValues();

      setChatting(true);
      setChatView(form.chatView!);

      const duration = toInt(form.audio.stopDuration ?? 0);
      const ticks = toInt(form.audio.stopTicks ?? 0);

      const service = new InworldService({
        onHistoryChange,
        capabilities: {
          ...(form.chatView !== CHAT_VIEW.TEXT && { phonemes: true }),
          ...(form.chatView === CHAT_VIEW.TEXT && { interruptions: true }),
          emotions: true,
          narratedActions: true,
        },
        ...(previousState && { continuation: { previousState } }),
        ...(duration &&
          ticks && {
            audioPlayback: {
              stop: { duration, ticks },
            },
          }),
        sceneName: form.scene?.name!,
        playerName: form.player?.name!,
        onPhoneme: (phonemes: AdditionalPhonemeInfo[]) => {
          setPhonemes(phonemes);
        },
        onReady: async () => {
          console.log('Ready!');
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
      const characters = await service.connection.getCharacters();
      const character = characters.find(
        (c: Character) => c.resourceName === form.character?.name,
      );

      if (character) {
        service.connection.setCurrentCharacter(character);

        const assets = character?.assets;
        const rpmImageUri = assets?.rpmImageUriPortrait;
        const avatarImg = assets?.avatarImg;
        setAvatar(avatarImg || rpmImageUri || '');
      }

      setConnection(service.connection);

      setCharacter(character);
      setCharacters(characters);
    },
    [formMethods, onHistoryChange],
  );

  const stopChatting = useCallback(async () => {
    // Disable flags
    setChatting(false);

    // Stop audio playing and capturing
    connection?.player?.stop();
    connection?.player?.clear();
    connection?.recorder?.stop();

    // Clear collections
    setChatHistory([]);

    // Close connection and clear connection data
    connection?.close();
    setConnection(undefined);
    setCharacter(undefined);
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
      {character ? (
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
                  character.assets.rpmModelUri ||
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
                {chatView === CHAT_VIEW.TEXT && (
                  <Grid item sm={6}>
                    {avatar && (
                      <CircularRpmAvatar
                        src={avatar}
                        name={character.displayName}
                        size="48px"
                        sx={{ display: ['none', 'flex'] }}
                      />
                    )}
                  </Grid>
                )}
              </Grid>
            </SimulatorHeader>
            <Chat
              chatView={chatView}
              chatHistory={chatHistory}
              connection={connection!}
              emotions={emotions}
              onRestore={openConnection}
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
