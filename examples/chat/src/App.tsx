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
import { Button, Grid } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Chat } from './app/chat/Chat';
import { Avatar } from './app/components/3dAvatar/Avatar';
import { CircularRpmAvatar } from './app/components/CircularRpmAvatar';
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
import { CHAT_VIEW, Configuration, EmotionsMap } from './app/types';
import { config } from './config';
import * as defaults from './defaults';

interface CurrentContext {
  characters: Character[];
  chatting: boolean;
  connection?: InworldConnectionService;
}

function App() {
  const formMethods = useForm<Configuration>({ mode: 'onChange' });

  const [initialized, setInitialized] = useState(false);
  const [connection, setConnection] = useState<InworldConnectionService>();
  const [character, setCharacter] = useState<Character>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [chatting, setChatting] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [chatView, setChatView] = useState(CHAT_VIEW.TEXT);
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

  const openConnection = useCallback(async () => {
    const form = formMethods.getValues();

    setChatting(true);
    setChatView(form.chatView!);
    setPlayerName(form.player?.name!);

    const service = new InworldService({
      onHistoryChange,
      capabilities: {
        ...(form.chatView === CHAT_VIEW.AVATAR && { phonemes: true }),
        emotions: true,
        narratedActions: true,
      },
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
      (c: Character) => c.getResourceName() === form.character?.name,
    );

    if (character) {
      service.connection.setCurrentCharacter(character);

      const assets = character?.getAssets();
      const rpmImageUri = assets?.rpmImageUriPortrait;
      const avatarImg = assets?.avatarImg;
      setAvatar(avatarImg || rpmImageUri || '');
    }

    setConnection(service.connection);

    setCharacter(character);
    setCharacters(characters);
  }, [formMethods, onHistoryChange]);

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
        ? (JSON.parse(configuration) as Configuration)
        : defaults.configuration),
    });

    setInitialized(true);
  }, [formMethods]);

  const content = chatting ? (
    <>
      {character ? (
        <MainWrapper>
          <ChatWrapper>
            <Avatar
              emotionEvent={emotionEvent}
              phonemes={phonemes}
              visible={chatView === CHAT_VIEW.AVATAR}
              url={
                config.RPM_AVATAR ||
                character.getAssets().rpmModelUri ||
                defaults.DEFAULT_RPM_AVATAR
              }
            />
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
                        name={character.getDisplayName()}
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
              playerName={playerName}
            />
          </ChatWrapper>
        </MainWrapper>
      ) : (
        'Loading...'
      )}
    </>
  ) : (
    <ConfigView
      canStart={formMethods.formState.isValid}
      onStart={openConnection}
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
