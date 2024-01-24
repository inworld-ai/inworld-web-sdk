import '../mocks/window.mock';

import { v4 } from 'uuid';

import { DataChunkDataType } from '../../proto/ai/inworld/packets/packets.pb';
import { AudioSessionState } from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import { InworldHistory } from '../../src/components/history';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { GrpcAudioRecorder } from '../../src/components/sound/grpc_audio.recorder';
import { GrpcWebRtcLoopbackBiDiSession } from '../../src/components/sound/grpc_web_rtc_loopback_bidi.session';
import {
  QueueItem,
  WebSocketConnection,
} from '../../src/connection/web-socket.connection';
import {
  InworldPacket,
  InworldPacketType,
  Routing,
} from '../../src/entities/inworld_packet.entity';
import { EventFactory } from '../../src/factories/event';
import { ConnectionService } from '../../src/services/connection.service';
import { InworldConnectionService } from '../../src/services/inworld_connection.service';
import { WorldEngineService } from '../../src/services/pb/world_engine.service';
import { ExtendedInworldPacket } from '../data_structures';
import {
  convertAgentsToCharacters,
  createAgent,
  createCharacter,
  extension,
  generateSessionToken,
  getPacketId,
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

const connection = new ConnectionService({
  config: {
    capabilities: {
      audio: true,
      emotions: true,
    },
  },
  grpcAudioPlayer,
  webRtcLoopbackBiDiSession,
  generateSessionToken,
  onHistoryChange,
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

  test('should get history', () => {
    const history = new InworldHistory();
    const packetId = getPacketId();
    const routing: Routing = {
      source: {
        name: v4(),
        isPlayer: true,
        isCharacter: false,
      },
      target: {
        name: characters[0].id,
        isPlayer: false,
        isCharacter: true,
      },
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

    expect(service.getHistory()).toEqual(history.get());
    expect(getHistory).toHaveBeenCalledTimes(1);
  });

  test('should clear history', () => {
    const clearHistory = jest
      .spyOn(ConnectionService.prototype, 'clearHistory')
      .mockImplementationOnce(jest.fn);

    service.clearHistory();

    expect(clearHistory).toHaveBeenCalledTimes(1);
  });

  test('should return transcript', () => {
    const result = 'test';
    const getTranscript = jest
      .spyOn(ConnectionService.prototype, 'getTranscript')
      .mockImplementationOnce(() => result);

    const transcript = service.getTranscript();

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
        .spyOn(ConnectionService.prototype, 'isActive')
        .mockImplementation(() => true);
      jest
        .spyOn(ConnectionService.prototype, 'getEventFactory')
        .mockImplementation(() => eventFactory);
      jest
        .spyOn(grpcAudioPlayer, 'excludeCurrentInteractionPackets')
        .mockImplementation(() => []);
      service = new InworldConnectionService({
        connection,
        grpcAudioPlayer,
        grpcAudioRecorder,
        webRtcLoopbackBiDiSession,
      });
      eventFactory.setCharacters(characters);
      eventFactory.setCurrentCharacter(character);
    });

    test('should send audio', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const chunk = v4();

      const packet = await service.sendAudio(chunk);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet).toHaveProperty('type', DataChunkDataType.AUDIO);
      expect(packet.audio).toHaveProperty('chunk', chunk);
    });

    test('should send text', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const text = v4();

      const packet = await service.sendText(text);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.text).toHaveProperty('text', text);
    });

    test('should send trigger without parameters', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const name = v4();

      const packet = await service.sendTrigger(name);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.trigger).toHaveProperty('name', name);
      expect(packet.trigger).toHaveProperty('parameters', undefined);
    });

    test('should send trigger with parameters', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);
      const warn = jest.spyOn(global.console, 'warn').mockImplementation();

      const name = v4();
      const parameters = [{ name: v4(), value: v4() }];

      const packet = await service.sendTrigger(name, parameters);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(warn).toBeCalledTimes(1);
      expect(packet.trigger).toHaveProperty('name', name);
      expect(packet.trigger).toHaveProperty('parameters', parameters);
    });

    test('should send audio session start', async () => {
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendAudioSessionStart();

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
    });

    test('should throw error if audio session was started twice', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

      await service.sendAudioSessionStart();

      expect(async () => {
        await service.sendAudioSessionStart();
      }).rejects.toThrow('Audio session is already started');
    });

    test('should throw error if audio session was finished twice', async () => {
      jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

      await service.sendAudioSessionStart();
      await service.sendAudioSessionEnd();

      expect(async () => {
        await service.sendAudioSessionEnd();
      }).rejects.toThrow(
        'Audio session cannot be ended because it has not been started',
      );
    });

    test('should send audio session end', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock)
        .mockImplementationOnce(writeMock);
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

      await service.sendAudioSessionStart();
      const packet = await service.sendAudioSessionEnd();

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(packet.isControl()).toEqual(true);
    });

    test('should send cancel responses', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendCancelResponse({ utteranceId: [v4()] });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isCancelResponse()).toEqual(true);
    });

    test('should send narrated action', async () => {
      jest
        .spyOn(WorldEngineService.prototype, 'loadScene')
        .mockImplementationOnce(() => Promise.resolve({ agents }));
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const text = v4();

      const packet = await service.sendNarratedAction(text);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet?.narratedAction).toHaveProperty('text', text);
    });

    test('should send tts playback end', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackStart();

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackStart()).toEqual(true);
    });

    test('should send tts playback start', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackEnd();

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackEnd()).toEqual(true);
    });

    test('should send tts playback mute', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackMute(true);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackMute()).toEqual(true);
    });

    test('should send tts playback unmute', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackMute(false);

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackUnmute()).toEqual(true);
    });

    test('should interrupt', async () => {
      const interrupt = jest
        .spyOn(ConnectionService.prototype, 'interrupt')
        .mockImplementationOnce(jest.fn());

      await service.interrupt();

      expect(interrupt).toHaveBeenCalledTimes(1);
    });

    test('should send custom packet', async () => {
      const connection = new ConnectionService<ExtendedInworldPacket>({
        grpcAudioPlayer,
        webRtcLoopbackBiDiSession,
        generateSessionToken,
        onHistoryChange,
        extension,
      });
      const service = new InworldConnectionService({
        connection,
        grpcAudioPlayer,
        grpcAudioRecorder,
        webRtcLoopbackBiDiSession,
      });
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(
          async (item: QueueItem<ExtendedInworldPacket>) => {
            const packet = extension.convertPacketFromProto(item.getPacket());
            await item.beforeWriting?.(packet);
            item.afterWriting?.(packet);
          },
        );

      const interactionId = v4();
      const mutation = { regenerateResponse: { interactionId } };
      const baseProtoPacket = service.baseProtoPacket();
      const packet = await service.sendCustomPacket(() => ({
        ...baseProtoPacket,
        packetId: { ...baseProtoPacket.packetId, interactionId },
        mutation,
      }));

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet).toHaveProperty('mutation', mutation);
    });
  });

  describe('multi characters', () => {
    const externalCharacters = [createCharacter(), createCharacter()];

    beforeEach(() => {
      jest
        .spyOn(ConnectionService.prototype, 'isActive')
        .mockImplementation(() => true);
      jest
        .spyOn(ConnectionService.prototype, 'getEventFactory')
        .mockImplementation(() => eventFactory);
      jest
        .spyOn(grpcAudioPlayer, 'excludeCurrentInteractionPackets')
        .mockImplementation(() => []);
      service = new InworldConnectionService({
        connection,
        grpcAudioPlayer,
        grpcAudioRecorder,
        webRtcLoopbackBiDiSession,
      });
      eventFactory.setCharacters(characters);
    });

    test('should send audio', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const chunk = v4();

      const packet = await service.sendAudio(chunk, {
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet).toHaveProperty('type', DataChunkDataType.AUDIO);
      expect(packet.audio).toHaveProperty('chunk', chunk);
    });

    test('should send text', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const text = v4();

      const packet = await service.sendText(text, {
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.text).toHaveProperty('text', text);
    });

    test('should send trigger', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const name = v4();

      const packet = await service.sendTrigger(name, {
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.trigger).toHaveProperty('name', name);
      expect(packet.trigger).toHaveProperty('parameters', undefined);
    });

    test('should send audio session start', async () => {
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendAudioSessionStart({
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
    });

    test('should send audio session end', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock)
        .mockImplementationOnce(writeMock);
      jest
        .spyOn(ConnectionService.prototype, 'getAudioSessionAction')
        .mockImplementationOnce(() => AudioSessionState.UNKNOWN);

      await service.sendAudioSessionStart();
      const packet = await service.sendAudioSessionEnd({
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(2);
      expect(packet.isControl()).toEqual(true);
    });

    test('should send cancel responses', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendCancelResponse(
        { utteranceId: [v4()] },
        {
          characters: externalCharacters,
        },
      );

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isCancelResponse()).toEqual(true);
    });

    test('should send narrated action', async () => {
      jest
        .spyOn(WorldEngineService.prototype, 'loadScene')
        .mockImplementationOnce(() => Promise.resolve({ agents }));
      jest
        .spyOn(EventFactory.prototype, 'getCharacters')
        .mockReturnValueOnce(characters);
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const text = v4();

      const packet = await service.sendNarratedAction(text, {
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet?.narratedAction).toHaveProperty('text', text);
    });

    test('should send tts playback end', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackStart({
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackStart()).toEqual(true);
    });

    test('should send tts playback start', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackEnd({
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackEnd()).toEqual(true);
    });

    test('should send tts playback mute', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackMute(true, {
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackMute()).toEqual(true);
    });

    test('should send tts playback unmute', async () => {
      const write = jest
        .spyOn(WebSocketConnection.prototype, 'write')
        .mockImplementationOnce(writeMock);

      const packet = await service.sendTTSPlaybackMute(false, {
        characters: externalCharacters,
      });

      expect(open).toHaveBeenCalledTimes(0);
      expect(write).toHaveBeenCalledTimes(1);
      expect(packet.isControl()).toEqual(true);
      expect(packet.isTTSPlaybackUnmute()).toEqual(true);
    });
  });
});

describe('character', () => {
  let service: InworldConnectionService;

  beforeEach(() => {
    jest
      .spyOn(ConnectionService.prototype, 'getEventFactory')
      .mockImplementationOnce(() => eventFactory);

    service = new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });
  });

  test('should return characters', async () => {
    const result = await service.getCharacters();

    expect(result).toEqual(characters);
  });

  test('should return current character', async () => {
    const getCurrentCharacter = jest
      .spyOn(eventFactory, 'getCurrentCharacter')
      .mockImplementationOnce(() => characters[0]);

    const result = await service.getCurrentCharacter();

    expect(result).toEqual(characters[0]);
    expect(getCurrentCharacter).toHaveBeenCalledTimes(1);
  });

  test('should set current character', async () => {
    const setCurrentCharacter = jest.spyOn(eventFactory, 'setCurrentCharacter');

    service.setCurrentCharacter(characters[0]);

    expect(setCurrentCharacter).toHaveBeenCalledTimes(1);
    expect(setCurrentCharacter).toHaveBeenCalledWith(characters[0]);
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

    const sendAudioSessionStart = jest
      .spyOn(InworldConnectionService.prototype, 'sendAudioSessionStart')
      .mockImplementationOnce(jest.fn());
    const sendAudio = jest
      .spyOn(InworldConnectionService.prototype, 'sendAudio')
      .mockImplementationOnce(jest.fn());

    const service = new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });

    await service.recorder.start();

    expect(sendAudioSessionStart).toHaveBeenCalledTimes(1);
    expect(sendAudio).toHaveBeenCalledTimes(1);
  });

  test('should send audio session start af first for inactive connection', async () => {
    jest
      .spyOn(ConnectionService.prototype, 'isActive')
      .mockImplementationOnce(() => true);

    const sendAudioSessionStart = jest
      .spyOn(InworldConnectionService.prototype, 'sendAudioSessionStart')
      .mockImplementationOnce(jest.fn());
    const sendAudio = jest
      .spyOn(InworldConnectionService.prototype, 'sendAudio')
      .mockImplementationOnce(jest.fn());

    const service = new InworldConnectionService({
      connection,
      grpcAudioPlayer,
      grpcAudioRecorder,
      webRtcLoopbackBiDiSession,
    });

    await service.recorder.start();

    expect(sendAudioSessionStart).toHaveBeenCalledTimes(0);
    expect(sendAudio).toHaveBeenCalledTimes(1);
  });
});
