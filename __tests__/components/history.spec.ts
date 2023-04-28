import '../mocks/window.mock';

import { v4 } from 'uuid';

import {
  CHAT_HISTORY_TYPE,
  HistoryItemActor,
  InworldHistory,
} from '../../src/components/history';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import {
  InworlControlType,
  InworldPacket,
  InworldPacketType,
  PacketId,
  Routing,
} from '../../src/entities/inworld_packet.entity';
import { createCharacter, user } from '../helpers';

const characters = [createCharacter(), createCharacter()];
const packetId: PacketId = {
  packetId: v4(),
  interactionId: v4(),
  utteranceId: v4(),
};
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
const date = new Date().toISOString();
const grpcAudioPlayer = new GrpcAudioPlayback();
const textPacket = new InworldPacket({
  packetId,
  routing,
  date,
  text: {
    text: v4(),
    final: false,
  },
  type: InworldPacketType.TEXT,
});
const triggerPacket = new InworldPacket({
  packetId,
  routing,
  date,
  trigger: { name: v4() },
  type: InworldPacketType.TRIGGER,
});
const narracterActionPacket = new InworldPacket({
  packetId,
  routing,
  date,
  narratedAction: { text: v4() },
  type: InworldPacketType.NARRATED_ACTION,
});
const interactionEndPacket = new InworldPacket({
  packetId,
  routing,
  date,
  trigger: { name: v4() },
  type: InworldPacketType.CONTROL,
  control: {
    type: InworlControlType.INTERACTION_END,
  },
});

const createHistoryWithPacket = (packet: InworldPacket) => {
  const history = new InworldHistory();

  history.addOrUpdate({ characters, grpcAudioPlayer, packet });

  return history;
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('should be empty by default', () => {
  const history = new InworldHistory();

  expect(history.get().length).toEqual(0);
});

describe('text', () => {
  describe('addOrUpdate', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should add packet to history', () => {
      const history = createHistoryWithPacket(textPacket);
      const item = history.get()[0] as HistoryItemActor;

      expect(history.get().length).toEqual(1);
      expect(item.character.id).toEqual(characters[0].id);
    });

    test('should add packet to queue', () => {
      jest
        .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
        .mockImplementationOnce(() => true);

      const history = createHistoryWithPacket(textPacket);

      expect(history.get().length).toEqual(0);
    });

    test('should find and update existing packet in history', () => {
      const text = v4();
      const history = createHistoryWithPacket(textPacket);
      const firstItem = history.get()[0] as HistoryItemActor;

      expect(firstItem.type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
      expect(firstItem.text).toEqual(textPacket.text.text);
      expect(history.get().length).toEqual(1);

      history.addOrUpdate({
        characters,
        grpcAudioPlayer,
        packet: new InworldPacket({
          packetId,
          routing,
          date,
          text: { text, final: false },
          type: InworldPacketType.TEXT,
        }),
      });

      const secondItem = history.get()[0] as HistoryItemActor;

      expect(secondItem.type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
      expect(secondItem.text).not.toEqual(firstItem.text);
      expect(secondItem.text).toEqual(text);
      expect(history.get().length).toEqual(1);
    });
  });

  describe('display', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should display packet stored in queue', () => {
      jest
        .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
        .mockImplementationOnce(() => true);

      const history = createHistoryWithPacket(textPacket);

      expect(history.get().length).toEqual(0);

      history.display(textPacket, CHAT_HISTORY_TYPE.ACTOR);

      expect(history.get().length).toEqual(1);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should update exising packet', () => {
      const text = v4();
      const history = createHistoryWithPacket(textPacket);
      const firstItem = history.get()[0] as HistoryItemActor;

      expect(firstItem.type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
      expect(firstItem.text).toEqual(textPacket.text.text);
      expect(history.get().length).toEqual(1);

      history.update(
        new InworldPacket({
          packetId,
          routing,
          date,
          text: { text, final: false },
          type: InworldPacketType.TEXT,
        }),
      );

      const secondItem = history.get()[0] as HistoryItemActor;

      expect(secondItem.type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
      expect(secondItem.text).not.toEqual(firstItem.text);
      expect(secondItem.text).toEqual(text);
      expect(history.get().length).toEqual(1);
    });

    test('should do nothing if packet is out of history', () => {
      const text = v4();
      const history = createHistoryWithPacket(textPacket);
      const firstItem = history.get()[0] as HistoryItemActor;

      expect(firstItem.type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
      expect(firstItem.text).toEqual(textPacket.text.text);
      expect(history.get().length).toEqual(1);

      history.update(
        new InworldPacket({
          packetId: {
            packetId: v4(),
            utteranceId: v4(),
            interactionId: v4(),
          },
          routing,
          date,
          text: { text, final: false },
          type: InworldPacketType.TEXT,
        }),
      );

      const secondItem = history.get()[0] as HistoryItemActor;

      expect(secondItem.type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
      expect(secondItem.text).not.toEqual(text);
      expect(history.get().length).toEqual(1);
    });
  });

  describe('filter', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should filter history', () => {
      const history = createHistoryWithPacket(textPacket);

      expect(history.get().length).toEqual(1);

      history.filter({
        utteranceId: [packetId.utteranceId],
        interactionId: packetId.interactionId,
      });

      expect(history.get().length).toEqual(0);
    });

    test('should filter queue', () => {
      jest
        .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
        .mockImplementationOnce(() => true);

      const history = createHistoryWithPacket(textPacket);

      expect(history.get().length).toEqual(0);

      history.filter({
        utteranceId: [packetId.utteranceId],
        interactionId: packetId.interactionId,
      });

      expect(history.get().length).toEqual(0);

      history.display(textPacket, CHAT_HISTORY_TYPE.ACTOR);

      expect(history.get().length).toEqual(0);
    });
  });

  describe('clear', () => {
    test('should clear history', () => {
      const history = createHistoryWithPacket(textPacket);

      expect(history.get().length).toEqual(1);

      history.clear();

      expect(history.get().length).toEqual(0);
    });
  });

  describe('transcript', () => {
    test('should return empty transcript for empty history', () => {
      const history = new InworldHistory();

      const transcript = history.getTranscript();

      expect(transcript).toEqual('');
    });

    describe('text', () => {
      test('should return transcript for provided user name', () => {
        const userRequest = {
          id: user.id,
          name: user.fullName,
        };
        const history = createHistoryWithPacket(textPacket);

        const expected = `${user.fullName}: ${textPacket.text.text}`;
        const transcript = history.getTranscript(userRequest);

        expect(transcript).toEqual(expected);
      });

      test('should return transcript for default user name', () => {
        const history = createHistoryWithPacket(textPacket);

        const expected = `User: ${textPacket.text.text}`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });

      test('should return transcript with new line', () => {
        const secondPacket = new InworldPacket({
          packetId: {
            packetId: v4(),
            interactionId: v4(),
            utteranceId: v4(),
          },
          routing,
          date,
          text: { text: v4(), final: false },
          type: InworldPacketType.TEXT,
        });
        const history = createHistoryWithPacket(textPacket);
        history.addOrUpdate({
          characters,
          grpcAudioPlayer,
          packet: secondPacket,
        });

        const expected = `User: ${textPacket.text.text}\nUser: ${secondPacket.text.text}`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });
    });

    describe('trigger', () => {
      test('should return transcript', () => {
        const history = createHistoryWithPacket(triggerPacket);

        const expected = `>>> ${triggerPacket.trigger.name}`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });
    });

    describe('narrated action', () => {
      test('should return transcript', () => {
        const history = createHistoryWithPacket(narracterActionPacket);

        const expected = `User: ${narracterActionPacket.narratedAction.text}`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });
    });

    test('should return transcript with new line', () => {
      const triggerPacket = new InworldPacket({
        packetId: {
          packetId: v4(),
          interactionId: v4(),
          utteranceId: v4(),
        },
        routing,
        date,
        trigger: { name: v4() },
        type: InworldPacketType.TRIGGER,
      });
      const history = createHistoryWithPacket(textPacket);
      history.addOrUpdate({
        characters,
        grpcAudioPlayer,
        packet: triggerPacket,
      });

      const expected = `User: ${textPacket.text.text}\n>>> ${triggerPacket.trigger.name}`;
      const transcript = history.getTranscript();

      expect(transcript).toEqual(expected);
    });
  });
});

describe('trigger', () => {
  test('should add packet to history', () => {
    const history = createHistoryWithPacket(triggerPacket);

    expect(history.get().length).toEqual(1);
  });
});

describe('narrated action', () => {
  test('should add packet to history', () => {
    const history = createHistoryWithPacket(narracterActionPacket);

    expect(history.get().length).toEqual(1);
  });
});

describe('interaction end', () => {
  test('should add packet to history', () => {
    const history = createHistoryWithPacket(interactionEndPacket);

    expect(history.get().length).toEqual(1);
  });

  test('should add packet to queue', () => {
    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementationOnce(() => true);

    const history = createHistoryWithPacket(interactionEndPacket);

    expect(history.get().length).toEqual(0);
  });

  test("should display packet stored in queue if it's last one", () => {
    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementationOnce(() => true);

    const history = createHistoryWithPacket(textPacket);

    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => true);

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: new InworldPacket({
        packetId,
        routing,
        date,
        narratedAction: { text: v4() },
        type: InworldPacketType.NARRATED_ACTION,
      }),
    });

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: interactionEndPacket,
    });

    expect(history.get().length).toEqual(0);

    history.display(textPacket, CHAT_HISTORY_TYPE.ACTOR);
    history.display(textPacket, CHAT_HISTORY_TYPE.NARRATED_ACTION);
    history.display(interactionEndPacket, CHAT_HISTORY_TYPE.INTERACTION_END);

    expect(history.get().length).toEqual(3);
  });

  test("should not display packet stored in queue if it's not last one", () => {
    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementationOnce(() => true);

    const history = createHistoryWithPacket(textPacket);

    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementationOnce(() => true);

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: interactionEndPacket,
    });

    expect(history.get().length).toEqual(0);

    history.display(interactionEndPacket, CHAT_HISTORY_TYPE.INTERACTION_END);

    expect(history.get().length).toEqual(0);
  });
});
