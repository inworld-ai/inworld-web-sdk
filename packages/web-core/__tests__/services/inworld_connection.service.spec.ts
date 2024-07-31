import '../mocks/window.mock';

import { v4 } from 'uuid';

import {
  AudioSessionStartPayloadMicrophoneMode,
  ControlEventAction,
  DataChunkDataType,
} from '../../proto/ai/inworld/packets/packets.pb';
import { ProtoPacket } from '../../src';
import {
  AudioSessionState,
  ConversationMapItem,
  ConversationState,
  InworldPacketType,
  LoadedScene,
  MicrophoneMode,
  TtsPlaybackAction,
} from '../../src/common/data_structures';
import {
  CHARACTER_HAS_INVALID_FORMAT,
  SCENE_HAS_INVALID_FORMAT,
} from '../../src/common/errors';
import { protoTimestamp } from '../../src/common/helpers';
import {
  CHAT_HISTORY_TYPE,
  HistoryItem,
  InworldHistory,
} from '../../src/components/history';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../../src/components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import {
  QueueItem,
  WebSocketConnection,
} from '../../src/connection/web-socket.connection';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { Routing } from '../../src/entities/packets/routing.entity';
import { EventFactory } from '../../src/factories/event';
import { ConnectionService } from '../../src/services/connection.service';
import { ConversationService } from '../../src/services/conversation.service';
import { InworldConnectionService } from '../../src/services/inworld_connection.service';
import { ExtendedInworldPacket } from '../data_structures';
import {
  conversationId,
  conversationUpdated,
  convertAgentsToCharacters,
  createAgent,
  extension,
  generateSessionToken,
  getPacketId,
  SCENE,
  setNavigatorProperty,
  setTimeoutMock,
  writeMock,
} from '../helpers';

const agents = [createAgent(), createAgent()];
const characters = convertAgentsToCharacters(agents);
const eventFactory = new EventFactory();
const grpcAudioPlayer = new GrpcAudioPlayback();
const grpcAudioRecorder = new GrpcAudioRecorder();
const webRtcLoopbackBiDiSession = new GrpcWebRtcLoopbackBiDiSession();
const onHistoryChange = jest.fn();
const onError = jest.fn();

let connection: ConnectionService;

beforeEach(() => {
  connection = new ConnectionService({
    config: {
      capabilities: {
        audio: true,
        emotions: true,
      },
    },
    name: SCENE,
    grpcAudioPlayer,
    webRtcLoopbackBiDiSession,
    generateSessionToken,
    onHistoryChange,
    onError,
  });
});

test('should open connection', async () => {
  const service = new InworldConnectionService({
    connection,
    grpcAudioPlayer,
    grpcAudioRecorder,
    webRtcLoopbackBiDiSession,
  });
  const open = jest
    .spyOn(ConnectionService.prototype, 'openManually')
    .mockImplementationOnce(jest.fn());

  await service.open();

  expect(open).toHaveBeenCalledTimes(1);
});

test('should return active state', () => {
  const service = new InworldConnectionService({
    connection,
    grpcAudioPlayer,
    grpcAudioRecorder,
    webRtcLoopbackBiDiSession,
  });

  jest
    .spyOn(ConnectionService.prototype, 'isActive')
    .mockImplementationOnce(() => true);

  expect(service.isActive()).toEqual(true);
});

test('close', async () => {
  const service = new InworldConnectionService({
    connection,
    grpcAudioPlayer,
    grpcAudioRecorder,
    webRtcLoopbackBiDiSession,
  });
  const close = jest
    .spyOn(connection, 'close')
    .mockImplementationOnce(jest.fn());
  const playerStop = jest
    .spyOn(GrpcAudioPlayback.prototype, 'stop')
    .mockImplementationOnce(jest.fn());

  const recorderStop = jest
    .spyOn(GrpcAudioRecorder.prototype, 'stopConvertion')
    .mockImplementationOnce(jest.fn());

  await service.close();

  expect(close).toHaveBeenCalledTimes(1);
  expect(playerStop).toHaveBeenCalledTimes(1);
  expect(recorderStop).toHaveBeenCalledTimes(1);
});

test('should get session state', async () => {
  const service = new InworldConnectionService({
    connection,
    grpcAudioPlayer,
    grpcAudioRecorder,
    webRtcLoopbackBiDiSession,
  });
  const getSessionState = jest
    .spyOn(ConnectionService.prototype, 'getSessionState')
    .mockImplementationOnce(jest.fn());

  await service.getSessionState();

  expect(getSessionState).toHaveBeenCalledTimes(1);
});

describe('history', () => {
  let service: InworldConnectionService;

  beforeEach(() => {
    service = new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });
  });

  test('should get full history', () => {
    const history = new InworldHistory({
      scene: SCENE,
      audioEnabled: true,
      conversations: new Map<string, ConversationMapItem>(),
    });
    const packetId = getPacketId();
    const routing: Routing = {
      source: {
        name: v4(),
        isPlayer: true,
        isCharacter: false,
      },
      targets: [
        {
          name: characters[0].id,
          isPlayer: false,
          isCharacter: true,
        },
      ],
    };
    const date = protoTimestamp();
    const packet = new InworldPacket({
      packetId,
      routing,
      date,
      text: {
        text: v4(),
        final: false,
      },
      type: InworldPacketType.TEXT,
    });
    history.addOrUpdate({ characters, grpcAudioPlayer, packet });

    const getHistory = jest
      .spyOn(ConnectionService.prototype, 'getHistory')
      .mockImplementationOnce(() => history.get());

    expect(service.getFullHistory()).toEqual(history.get());
    expect(getHistory).toHaveBeenCalledTimes(1);
  });

  test('should clear empty history', () => {
    const clearHistory = jest
      .spyOn(ConnectionService.prototype, 'clearHistory')
      .mockImplementationOnce(jest.fn);
    const getHistory = jest
      .spyOn(service, 'getHistory')
      .mockImplementationOnce(() => []);

    service.clearHistory();

    expect(clearHistory).toHaveBeenCalledTimes(1);
    expect(getHistory).toHaveBeenCalledTimes(1);
    expect(onHistoryChange).toHaveBeenCalledTimes(0);
  });

  test('should clear not empty history', () => {
    const clearHistory = jest
      .spyOn(ConnectionService.prototype, 'clearHistory')
      .mockImplementationOnce(jest.fn);
    const getHistory = jest
      .spyOn(service, 'getHistory')
      .mockImplementationOnce(() => [{} as HistoryItem]);

    service.clearHistory();

    expect(clearHistory).toHaveBeenCalledTimes(1);
    expect(getHistory).toHaveBeenCalledTimes(1);
    expect(onHistoryChange).toHaveBeenCalledTimes(1);
  });

  test('should return full transcript', () => {
    const result = 'test';
    const getTranscript = jest
      .spyOn(ConnectionService.prototype, 'getTranscript')
      .mockImplementationOnce(() => result);

    const transcript = service.getFullTranscript();

    expect(getTranscript).toHaveBeenCalledTimes(1);
    expect(transcript).toEqual(result);
  });
});

describe('send', () => {
  let service: InworldConnectionService;

  const character = characters[0];
  const open = jest
    .spyOn(ConnectionService.prototype, 'open')
    .mockImplementationOnce(jest.fn());

  describe('single characters', () => {
    beforeEach(() => {
      jest
        .spyOn(ConversationService.prototype, 'getConversationId')
        .mockImplementation(() => conversationId);
      connection = new ConnectionService({
        config: {
          capabilities: {
            audio: true,
            emotions: true,
          },
        },
        name: SCENE,
        grpcAudioPlayer,
        webRtcLoopbackBiDiSession,
        generateSessionToken,
        onHistoryChange,
        onError,
      });

      connection.conversations.clear();
      service = new InworldConnectionService({
        connection,
        grpcAudioPlayer,
        grpcAudioRecorder,
        webRtcLoopbackBiDiSession,
      });
      eventFactory.setCharacters(characters);
      eventFactory.setCurrentCharacter(character);

      jest
        .spyOn(ConnectionService.prototype, 'isActive')
        .mockImplementation(() => true);
      jest
        .spyOn(ConnectionService.prototype, 'getEventFactory')
        .mockImplementation(() => eventFactory);
      jest
        .spyOn(grpcAudioPlayer, 'excludeCurrentInteractionPackets')
        .mockImplementation(() => []);
      jest
        .spyOn(ConnectionService.prototype, 'getCurrentCharacter')
        .mockImplementation(() => Promise.resolve(character));
      jest
        .spyOn(connection, 'getCharactersByResourceNames')
        .mockImplementation((names: string[]) =>
          characters.filter((character) =>
            names.includes(character.resourceName),
          ),
        );
    });

    test('should send audio', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const chunk = v4();

      const [packet] = await Promise.all([
        service.sendAudio(chunk),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().dataChunk!.type).toEqual(
        DataChunkDataType.AUDIO,
      );
      expect(packet).toHaveProperty('type', DataChunkDataType.AUDIO);
      expect(packet!.audio).toHaveProperty('chunk', chunk);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
      expect((await service.getCurrentConversation()).getCharacters()).toEqual([
        characters[0],
      ]);
      expect(
        (await service.getCurrentConversation()).getConversationId(),
      ).toEqual(conversationId);
    });

    test('should send text', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const text = v4();

      const [packet] = await Promise.all([
        service.sendText(text),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().text!.text).toEqual(text);
      expect(packet!.text).toHaveProperty('text', text);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
      expect(service.getHistory().length).toEqual(1);
      expect(service.getHistory()[0].type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
    });

    test('should send trigger without parameters', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const name = v4();

      const [packet] = await Promise.all([
        service.sendTrigger(name),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().custom?.name).toEqual(name);
      expect(packet!.trigger).toHaveProperty('name', name);
      expect(packet!.trigger.parameters).toBeUndefined();
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
    });

    test('should send trigger with parameters in the old way', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);
      const warn = jest.spyOn(global.console, 'warn').mockImplementation();

      const name = v4();
      const parameters = [{ name: v4(), value: v4() }];

      const [packet] = await Promise.all([
        service.sendTrigger(name, parameters),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().custom?.parameters).toEqual(
        parameters,
      );
      expect(warn).toHaveBeenCalledTimes(1);
      expect(packet!.trigger).toHaveProperty('name', name);
      expect(packet!.trigger).toHaveProperty('parameters', parameters);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
    });

    test('should send trigger with parameters in the new way', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);
      const warn = jest.spyOn(global.console, 'warn').mockImplementation();

      const name = v4();
      const parameters = [{ name: v4(), value: v4() }];

      const [packet] = await Promise.all([
        service.sendTrigger(name, { parameters }),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().custom?.parameters).toEqual(
        parameters,
      );
      expect(warn).toHaveBeenCalledTimes(0);
      expect(packet!.trigger).toHaveProperty('name', name);
      expect(packet!.trigger).toHaveProperty('parameters', parameters);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
    });

    test('should send audio session start', async () => {
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const [packet] = await Promise.all([
        service.sendAudioSessionStart(),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().control?.action).toEqual(
        ControlEventAction.AUDIO_SESSION_START,
      );
      expect(packet!.isControl()).toEqual(true);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
    });

    test('should send audio session start for push-to-talk', async () => {
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);
      const mode = MicrophoneMode.OPEN_MIC;

      const [packet] = await Promise.all([
        service.sendAudioSessionStart({ mode }),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().control).toEqual({
        action: ControlEventAction.AUDIO_SESSION_START,
        audioSessionStart: {
          mode: AudioSessionStartPayloadMicrophoneMode.OPEN_MIC,
        },
      });
      expect(packet!.isControl()).toEqual(true);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
    });

    test('should throw error if audio session was started twice', async () => {
      const conversationService = new ConversationService(connection, {
        participants: [characters[0].resourceName],
        addCharacters: jest.fn(),
      });

      connection.conversations.set(conversationService.getConversationId(), {
        service: conversationService,
        state: ConversationState.ACTIVE,
      });

      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

      await Promise.all([
        service.sendAudioSessionStart(),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(async () => {
        await service.sendAudioSessionStart();
      }).rejects.toThrow('Audio session is already started');
    });

    test('should throw error if audio session was finished twice', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

      await Promise.all([
        service.sendAudioSessionStart(),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      await service.sendAudioSessionEnd();

      expect(async () => {
        await service.sendAudioSessionEnd();
      }).rejects.toThrow(
        'Audio session cannot be ended because it has not been started',
      );
      expect(write).toHaveBeenCalledTimes(3);
    });

    test('should send audio session end', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

      await Promise.all([
        service.sendAudioSessionStart(),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      const packet = await service.sendAudioSessionEnd();

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(3);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().control?.action).toEqual(
        ControlEventAction.AUDIO_SESSION_START,
      );
      expect(packet!.isControl()).toEqual(true);
    });

    test('should send cancel responses', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const [packet] = await Promise.all([
        service.sendCancelResponse({ utteranceId: [v4()] }),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(packet!.isCancelResponse()).toEqual(true);
    });

    test('should send narrated action', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const text = v4();

      const [packet] = await Promise.all([
        service.sendNarratedAction(text),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(packet!.narratedAction).toHaveProperty('text', text);
    });

    test('should send tts playback mute', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const [packet] = await Promise.all([
        service.sendTTSPlaybackMute(true),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(packet!.isControl()).toEqual(true);
      expect(packet!.isTTSPlaybackMute()).toEqual(true);
    });

    test('should send tts playback unmute', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);

      const [packet] = await Promise.all([
        service.sendTTSPlaybackMute(false),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(packet!.isControl()).toEqual(true);
      expect(packet!.isTTSPlaybackUnmute()).toEqual(true);
    });

    test('should interrupt', async () => {
      const interrupt = jest
        .spyOn(ConnectionService.prototype, 'interrupt')
        .mockImplementationOnce(jest.fn());

      await service.interrupt();

      expect(interrupt).toHaveBeenCalledTimes(1);
    });

    test('should send custom packet', async () => {
      const grpcAudioPlayer = new GrpcAudioPlayback<ExtendedInworldPacket>();
      const connection = new ConnectionService<ExtendedInworldPacket>({
        grpcAudioPlayer,
        webRtcLoopbackBiDiSession,
        generateSessionToken,
        onHistoryChange,
        extension,
        name: SCENE,
      });
      const service = new InworldConnectionService({
        connection,
        grpcAudioPlayer,
        grpcAudioRecorder,
        webRtcLoopbackBiDiSession,
      });

      jest
        .spyOn(ConversationService.prototype, 'getConversationId')
        .mockImplementation(() => conversationId);
      jest
        .spyOn(connection, 'getCharactersByResourceNames')
        .mockImplementation((names: string[]) =>
          characters.filter((character) =>
            names.includes(character.resourceName),
          ),
        );

      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(async (item: QueueItem<ExtendedInworldPacket>) => {
          const packet = extension.convertPacketFromProto!(item.getPacket());
          await item.beforeWriting?.(packet);
          item.afterWriting?.(packet);
        });

      const interactionId = v4();
      const mutation = { regenerateResponse: { interactionId } };
      const baseProtoPacket = service.baseProtoPacket();

      const [packet] = await Promise.all([
        service.sendCustomPacket(() => ({
          ...baseProtoPacket,
          packetId: { ...baseProtoPacket.packetId, interactionId },
          mutation,
        })),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().mutation).toEqual(mutation);
      expect(packet).toHaveProperty('mutation', mutation);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
    });

    test('should reload scene', async () => {
      jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn());
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      const change = jest
        .spyOn(ConnectionService.prototype, 'change')
        .mockImplementationOnce(jest.fn());

      await service.reloadScene();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(open).toHaveBeenCalledTimes(0);
      expect(change).toHaveBeenCalledTimes(1);
    });

    test('should throw error in case wrong scene format', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      await expect(service.changeScene(v4())).rejects.toEqual(
        new Error(SCENE_HAS_INVALID_FORMAT),
      );
    });

    test('should change scene', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      const change = jest
        .spyOn(ConnectionService.prototype, 'change')
        .mockImplementationOnce(jest.fn());

      const name = `workspaces/${v4()}/scenes/${v4()}`;

      await service.changeScene(name);

      expect(open).toHaveBeenCalledTimes(0);
      expect(change).toHaveBeenCalledTimes(1);
    });

    test('should add character', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const names = [agents[0].brainName!, agents[1].brainName!];

      const [packet] = await Promise.all([
        service.addCharacters(names),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!({
              control: {
                action: ControlEventAction.CURRENT_SCENE_STATUS,
                currentSceneStatus: { agents },
              },
              packetId: { packetId: v4() },
            } as ProtoPacket);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet?.sceneMutation).toHaveProperty(
        'addedCharacterNames',
        names,
      );
    });

    test('should remove character', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      jest
        .spyOn(InworldConnectionService.prototype, 'getCharacters')
        .mockImplementationOnce(() => Promise.resolve(characters));
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const names = [agents[0].brainName!];
      const ids = [agents[0].agentId!];

      const conversationService = new ConversationService(connection, {
        participants: [characters[0].resourceName, characters[1].resourceName],
        addCharacters: jest.fn(),
      });

      connection.conversations.set(conversationService.getConversationId(), {
        service: conversationService,
        state: ConversationState.ACTIVE,
      });

      await service.removeCharacters(names);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(write.mock.calls[0][0].getPacket().mutation).toHaveProperty(
        'unloadCharacters',
        { agents: ids.map((id) => ({ agentId: id })) },
      );
    });

    test('should throw error in case wrong character format on add', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const names = [`workspaces/${v4()}/characters/${v4()}`, v4()];

      await expect(service.addCharacters(names)).rejects.toEqual(
        new Error(CHARACTER_HAS_INVALID_FORMAT),
      );
    });

    test('should throw error in case wrong character format on remove', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'openSession')
        .mockImplementationOnce(() =>
          Promise.resolve({ sceneStatus: { agents } } as LoadedScene),
        );
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const names = [`workspaces/${v4()}/characters/${v4()}`, v4()];

      await expect(service.removeCharacters(names)).rejects.toEqual(
        new Error(CHARACTER_HAS_INVALID_FORMAT),
      );
    });

    test('should add playback mute event to queue in case of auto reconnect', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementation(writeMock);
      jest
        .spyOn(ConversationService.prototype, 'getTtsPlaybackAction')
        .mockImplementationOnce(() => TtsPlaybackAction.MUTE);

      const text = v4();

      const [packet] = await Promise.all([
        service.sendText(text),
        new Promise((resolve: any) => {
          setTimeout(() => {
            connection.onMessage!(conversationUpdated);
            resolve(true);
          }, 0);
        }),
      ]);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(3);
      expect(write.mock.calls[0][0].getPacket().control?.action).toEqual(
        ControlEventAction.CONVERSATION_UPDATE,
      );
      expect(write.mock.calls[1][0].getPacket().control?.action).toEqual(
        ControlEventAction.TTS_PLAYBACK_MUTE,
      );
      expect(write.mock.calls[2][0].getPacket().text!.text).toEqual(text);
      expect(packet!.text).toHaveProperty('text', text);
      expect(service.getConversations()).toEqual([
        {
          conversationId,
          characters: [characters[0]],
        },
      ]);
    });

    test('should start conversation', async () => {
      const connection = new ConnectionService({
        config: {
          capabilities: {
            audio: true,
            emotions: true,
          },
        },
        name: SCENE,
        grpcAudioPlayer,
        webRtcLoopbackBiDiSession,
        generateSessionToken,
        onHistoryChange,
      });
      const service = new InworldConnectionService({
        connection,
        grpcAudioPlayer,
        grpcAudioRecorder,
        webRtcLoopbackBiDiSession,
      });

      jest
        .spyOn(connection, 'getCharactersByResourceNames')
        .mockImplementation((names: string[]) =>
          characters.filter((character) =>
            names.includes(character.resourceName),
          ),
        );

      expect(service.getConversations()).toEqual([]);

      service.startConversation([characters[0].resourceName]);
      service.getTranscript();

      expect(service.getConversations()).toEqual([
        {
          conversationId: expect.anything(),
          characters: [characters[0]],
        },
      ]);
      expect(service.getTranscript()).toEqual('');
    });

    test('should throw error if character is not set', async () => {
      const conversationService = new ConversationService(connection, {
        participants: [characters[0].resourceName],
        addCharacters: jest.fn(),
      });
      jest
        .spyOn(ConversationService.prototype, 'getConversationId')
        .mockImplementation(() => conversationId);
      jest
        .spyOn(connection, 'getCurrentCharacter')
        .mockImplementationOnce(() => Promise.resolve(undefined));

      connection.conversations.set(conversationService.getConversationId(), {
        service: conversationService,
        state: ConversationState.ACTIVE,
      });

      expect(async () => {
        await service.sendText(v4());
      }).rejects.toThrow('Current character is not set');
    });
  });
});

describe('character', () => {
  let service: InworldConnectionService;

  beforeEach(() => {
    connection = new ConnectionService({
      config: {
        capabilities: {
          audio: true,
          emotions: true,
        },
      },
      name: SCENE,
      grpcAudioPlayer,
      webRtcLoopbackBiDiSession,
      generateSessionToken,
      onHistoryChange,
      onError,
    });
    service = new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });

    jest
      .spyOn(ConnectionService.prototype, 'getCharacters')
      .mockImplementation(() => Promise.resolve(characters));
    jest
      .spyOn(ConnectionService.prototype, 'getEventFactory')
      .mockImplementationOnce(() => eventFactory);
    jest
      .spyOn(connection, 'getCharactersByResourceNames')
      .mockImplementation((names: string[]) =>
        characters.filter((character) =>
          names.includes(character.resourceName),
        ),
      );
    jest
      .spyOn(connection, 'getCharactersByIds')
      .mockImplementation((ids: string[]) =>
        characters.filter((character) => ids.includes(character.id)),
      );
  });

  test('should return characters', async () => {
    const result = await service.getCharacters();

    expect(result).toEqual(characters);
  });

  test('should find character by id', () => {
    expect(service.getCharacterById(characters[0].id)).toEqual(characters[0]);
    expect(service.getCharacterById(characters[1].id)).toEqual(characters[1]);
  });

  test('should find character by resource name', () => {
    expect(
      service.getCharacterByResourceName(characters[0].resourceName),
    ).toEqual(characters[0]);
    expect(
      service.getCharacterByResourceName(characters[1].resourceName),
    ).toEqual(characters[1]);
  });

  test('should return undefined if character is not found', () => {
    expect(service.getCharacterById(v4())).toBeUndefined();
    expect(service.getCharacterByResourceName(v4())).toBeUndefined();
  });

  test('should return current character', async () => {
    const getCurrentCharacter = jest.spyOn(connection, 'getCurrentCharacter');

    const result = await service.getCurrentCharacter();

    expect(result).toEqual(characters[0]);
    expect(getCurrentCharacter).toHaveBeenCalledTimes(1);
  });

  test('should set current character', async () => {
    jest
      .spyOn(service, 'getCurrentCharacter')
      .mockImplementationOnce(() => Promise.resolve(undefined!));
    const setCurrentCharacter = jest
      .spyOn(eventFactory, 'setCurrentCharacter')
      .mockImplementation(jest.fn());
    const updateParticipants = jest
      .spyOn(ConversationService.prototype, 'updateParticipants')
      .mockImplementation(jest.fn());

    await service.setCurrentCharacter(characters[0]);
    expect(setCurrentCharacter.mock.calls[0][0]).toEqual(characters[0]);

    const conversationService = await service.getCurrentConversation();

    connection.conversations.set(conversationService.getConversationId(), {
      service: conversationService,
      state: ConversationState.ACTIVE,
    });

    await service.setCurrentCharacter(characters[1]);

    expect(updateParticipants).toHaveBeenCalledTimes(1);
  });

  test('should change current character for existing one-to-one conversation', async () => {
    jest
      .spyOn(service, 'getCurrentCharacter')
      .mockImplementationOnce(() => Promise.resolve(characters[0]));
    jest
      .spyOn(ConversationService.prototype, 'sendText')
      .mockImplementation(jest.fn());

    const transcript = v4();
    const getTranscript = jest
      .spyOn(ConversationService.prototype, 'getTranscript')
      .mockImplementation(() => transcript);

    await service.sendText(v4());

    let conversation = await service.getCurrentConversation();

    expect(conversation.getCharacters()).toEqual([characters[0]]);

    await service.setCurrentCharacter(characters[1]);

    expect(conversation.getCharacters()).toEqual([characters[1]]);
    expect(service.getTranscript()).toEqual(transcript);
    expect(getTranscript).toHaveBeenCalledTimes(1);
  });
});

describe('listener', () => {
  beforeEach(() => {
    setNavigatorProperty('mediaDevices', {
      getUserMedia: jest.fn(() => new MediaStream()),
    });

    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(jest.fn());
    jest.spyOn(global, 'setInterval').mockImplementationOnce(setTimeoutMock);
  });

  test('should send audio session start af first for inactive connection', async () => {
    jest
      .spyOn(ConnectionService.prototype, 'isActive')
      .mockImplementationOnce(() => false);
    jest
      .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
      .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

    const getCurrentAudioConversation = jest
      .spyOn(ConnectionService.prototype, 'getCurrentAudioConversation')
      .mockImplementationOnce(
        () =>
          new ConversationService(connection, {
            participants: [],
            addCharacters: jest.fn(),
          }),
      );
    const sendAudioSessionStart = jest
      .spyOn(ConversationService.prototype, 'sendAudioSessionStart')
      .mockImplementationOnce(jest.fn());
    const sendAudio = jest
      .spyOn(ConversationService.prototype, 'sendAudio')
      .mockImplementationOnce(jest.fn());

    const service = new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });

    await service.recorder.start();

    expect(getCurrentAudioConversation).toHaveBeenCalledTimes(1);
    expect(sendAudioSessionStart).toHaveBeenCalledTimes(1);
    expect(sendAudio).toHaveBeenCalledTimes(1);
  });

  test('should throw error if current conversation is not set', async () => {
    const service = new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });

    jest
      .spyOn(ConnectionService.prototype, 'getCurrentAudioConversation')
      .mockImplementationOnce(() => undefined);

    await service.recorder.start();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toEqual(
      'No conversation is available to send audio.',
    );
  });
});
