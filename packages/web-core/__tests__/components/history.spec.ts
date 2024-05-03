import '../mocks/window.mock';

import { v4 } from 'uuid';

import {
  Extension,
  InworldPacketType,
  User,
} from '../../src/common/data_structures';
import { InworlControlAction } from '../../src/common/data_structures';
import { protoTimestamp } from '../../src/common/helpers';
import {
  CHAT_HISTORY_TYPE,
  HistoryItemActor,
  InworldHistory,
} from '../../src/components/history';
import { GrpcAudioPlayback } from '../../src/components/sound/grpc_audio.playback';
import { ControlEvent } from '../../src/entities/packets/control.entity';
import {
  EmotionBehavior,
  EmotionBehaviorCode,
} from '../../src/entities/packets/emotion/emotion_behavior.entity';
import {
  EmotionStrength,
  EmotionStrengthCode,
} from '../../src/entities/packets/emotion/emotion_strength.entity';
import { InworldPacket } from '../../src/entities/packets/inworld_packet.entity';
import { Routing } from '../../src/entities/packets/routing.entity';
import { TriggerEvent } from '../../src/entities/packets/trigger.entity';
import { ExtendedHistoryItem } from '../data_structures';
import { createCharacter, getPacketId, SCENE, user } from '../helpers';

const characters = [createCharacter(), createCharacter()];
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
  trigger: { name: v4(), parameters: [{ name: v4(), value: v4() }] },
  type: InworldPacketType.TRIGGER,
});
const narracterActionPacket = new InworldPacket({
  packetId,
  routing,
  date,
  narratedAction: { text: v4() },
  type: InworldPacketType.NARRATED_ACTION,
});
const emotionsPacket = new InworldPacket({
  packetId,
  routing,
  date,
  emotions: {
    behavior: new EmotionBehavior(EmotionBehaviorCode.NEUTRAL),
    strength: new EmotionStrength(EmotionStrengthCode.NORMAL),
  },
  type: InworldPacketType.EMOTION,
});
const interactionEndPacket = new InworldPacket({
  packetId,
  routing,
  date,
  trigger: new TriggerEvent({ name: v4() }),
  type: InworldPacketType.CONTROL,
  control: new ControlEvent({
    action: InworlControlAction.INTERACTION_END,
  }),
});
const sceneChangePacketRequest = new InworldPacket({
  packetId,
  routing,
  date,
  type: InworldPacketType.SCENE_MUTATION_RESPONSE,
  sceneMutation: { name: v4() },
});
const sceneChangePacketResponse = new InworldPacket({
  packetId,
  routing,
  date,
  type: InworldPacketType.SCENE_MUTATION_RESPONSE,
  sceneMutation: {
    addedCharacters: [characters[0]],
  },
});
const incomingTextPacket = new InworldPacket({
  packetId: {
    ...getPacketId(),
    interactionId: packetId.interactionId,
  },
  routing: {
    source: routing.targets[0],
    targets: [routing.source],
  },
  date,
  text: {
    text: v4(),
    final: false,
  },
  type: InworldPacketType.TEXT,
});

const createHistoryWithPacket = (
  packet: InworldPacket,
  {
    audioEnabled = true,
    fromHistory,
    extension,
    user,
  }: {
    audioEnabled?: boolean;
    fromHistory?: boolean;
    extension?: Extension<InworldPacket, ExtendedHistoryItem>;
    user?: User;
  } = {},
) => {
  const history = new InworldHistory({
    ...(extension && { extension }),
    user,
    scene: SCENE,
    audioEnabled,
  });

  history.addOrUpdate({ characters, grpcAudioPlayer, packet, fromHistory });

  return history;
};

test('should be empty by default', () => {
  const history = new InworldHistory({ scene: SCENE, audioEnabled: false });

  expect(history.get().length).toEqual(0);
});

describe('text', () => {
  describe('addOrUpdate', () => {
    test('should add runtime packet to history', () => {
      const history = createHistoryWithPacket(textPacket);
      const item = history.get()[0] as HistoryItemActor;

      expect(history.get().length).toEqual(1);
      expect(item.fromHistory).toEqual(false);
      expect(item.character!.id).toEqual(characters[0].id);
    });

    test('should add historical packet to history', () => {
      const history = createHistoryWithPacket(textPacket);
      const item = history.get()[0] as HistoryItemActor;

      expect(history.get().length).toEqual(1);
      expect(item.character!.id).toEqual(characters[0].id);
    });

    test('should add packet to queue', () => {
      jest
        .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
        .mockImplementation(() => true);

      const history = createHistoryWithPacket(incomingTextPacket);

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

    test('should convert packet to extended one', () => {
      const historyItem = jest.fn();
      const history = createHistoryWithPacket(textPacket, {
        extension: { historyItem },
      });
      const item = history.get()[0] as HistoryItemActor;

      expect(history.get().length).toEqual(1);
      expect(item.character!.id).toEqual(characters[0].id);
    });
  });

  describe('display', () => {
    test('should display packet stored in queue', () => {
      jest
        .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
        .mockImplementation(() => true);

      const history = createHistoryWithPacket(incomingTextPacket);

      expect(history.get().length).toEqual(0);

      history.display(incomingTextPacket);

      expect(history.get().length).toEqual(1);
    });
  });

  describe('update', () => {
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
          packetId: getPacketId(),
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
    test('should filter history', () => {
      const history = createHistoryWithPacket(textPacket);

      expect(history.get().length).toEqual(1);

      history.filter({
        utteranceId: [packetId.utteranceId!],
        interactionId: packetId.interactionId!,
      });

      expect(history.get().length).toEqual(0);
    });

    test('should filter queue by the same interactionId', () => {
      jest
        .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
        .mockImplementation(() => true);

      const history = createHistoryWithPacket(incomingTextPacket);

      expect(history.get().length).toEqual(0);

      history.filter({
        utteranceId: [packetId.utteranceId!],
        interactionId: packetId.interactionId!,
      });

      expect(history.get().length).toEqual(0);

      history.display(textPacket);

      expect(history.get().length).toEqual(0);
    });

    test('should filter queue by diferrent interactionId', () => {
      jest
        .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
        .mockImplementationOnce(() => true);

      const history = createHistoryWithPacket(incomingTextPacket);

      expect(history.get().length).toEqual(0);

      history.filter({
        utteranceId: [packetId.utteranceId!],
        interactionId: v4(),
      });

      expect(history.get().length).toEqual(0);

      history.display(textPacket);

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
      const history = new InworldHistory({ scene: SCENE, audioEnabled: true });

      const transcript = history.getTranscript();

      expect(transcript).toEqual('');
    });

    describe('text', () => {
      test('should return transcript for provided user name', () => {
        const history = createHistoryWithPacket(textPacket, { user });

        history.addOrUpdate({
          characters,
          grpcAudioPlayer,
          packet: incomingTextPacket,
          fromHistory: true,
        });

        const expected = `${user.fullName}: ${textPacket.text.text}\n${characters[0].displayName}: ${incomingTextPacket.text.text}`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });

      test('should return transcript for default user name', () => {
        const history = createHistoryWithPacket(textPacket);

        history.addOrUpdate({
          characters,
          grpcAudioPlayer,
          packet: incomingTextPacket,
          fromHistory: true,
        });

        const expected = `User: ${textPacket.text.text}\n${characters[0].displayName}: ${incomingTextPacket.text.text}`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });

      test('should combine multiple character messages in one', () => {
        const firstPacket = new InworldPacket({
          packetId: {
            ...getPacketId(),
            interactionId: packetId.interactionId,
          },
          routing: {
            source: routing.targets[0],
            targets: [routing.source],
          },
          date,
          text: {
            text: v4(),
            final: false,
          },
          type: InworldPacketType.TEXT,
        });
        const secondtPacket = new InworldPacket({
          packetId: {
            ...getPacketId(),
            interactionId: packetId.interactionId,
          },
          routing: {
            source: routing.targets[0],
            targets: [routing.source],
          },
          date,
          text: {
            text: v4(),
            final: false,
          },
          type: InworldPacketType.TEXT,
        });
        const history = createHistoryWithPacket(firstPacket, {
          fromHistory: true,
        });

        history.addOrUpdate({
          characters,
          grpcAudioPlayer,
          packet: secondtPacket,
          fromHistory: true,
        });

        const expected = `${characters[0].displayName}: ${firstPacket.text.text} ${secondtPacket.text.text}`;
        const transcript = history.getTranscript();
        expect(transcript).toEqual(expected);
      });

      test('should return transcript with new line', () => {
        const secondPacket = new InworldPacket({
          packetId: getPacketId(),
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

      test('should return transcript with emotions', () => {
        const history = createHistoryWithPacket(emotionsPacket);

        history.addOrUpdate({
          characters,
          grpcAudioPlayer,
          packet: textPacket,
        });

        const expected = `User: ${textPacket.text.text}`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });

      test('should return transcript with scene change', () => {
        const history = createHistoryWithPacket(sceneChangePacketRequest);

        history.addOrUpdate({
          characters,
          grpcAudioPlayer,
          packet: sceneChangePacketResponse,
        });

        const expected = `>>> Now moving to ${sceneChangePacketRequest.sceneMutation.name}`;
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

        const expected = `User: *${narracterActionPacket.narratedAction.text}*`;
        const transcript = history.getTranscript();

        expect(transcript).toEqual(expected);
      });
    });

    test('should return transcript with new line', () => {
      const triggerPacket = new InworldPacket({
        packetId: getPacketId(),
        routing,
        date,
        trigger: new TriggerEvent({ name: v4() }),
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
    const history = createHistoryWithPacket(triggerPacket, {
      audioEnabled: true,
    });

    expect(history.get().length).toEqual(1);
  });
});

describe('narrated action', () => {
  test('should add outgoing packet to history', () => {
    const history = createHistoryWithPacket(narracterActionPacket);

    expect(history.get().length).toEqual(1);
  });

  test('should replace placeholders for outgoing event', () => {
    const narracterActionPacket = new InworldPacket({
      packetId,
      routing,
      date,
      narratedAction: { text: '{character} some context {player}.' },
      type: InworldPacketType.NARRATED_ACTION,
    });

    const history = createHistoryWithPacket(narracterActionPacket);
    const result = history.get()[0] as HistoryItemActor;

    expect(result.text).toEqual(
      `${characters[0].displayName} some context User.`,
    );
  });

  test('should replace nothing for incoming event', () => {
    const text = '{character} some context {player}.';
    const narracterActionPacket = new InworldPacket({
      packetId,
      routing: {
        source: routing.targets[0],
        targets: [routing.source],
      },
      date,
      narratedAction: { text },
      type: InworldPacketType.NARRATED_ACTION,
    });

    const history = createHistoryWithPacket(narracterActionPacket, {
      fromHistory: true,
    });
    const result = history.get()[0] as HistoryItemActor;

    expect(result.text).toEqual(text);
  });
});

describe('interaction end', () => {
  test('should add packet to history', () => {
    const history = createHistoryWithPacket(interactionEndPacket, {
      audioEnabled: false,
    });

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
      .mockImplementation(() => true);

    const history = createHistoryWithPacket(incomingTextPacket);

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: new InworldPacket({
        packetId: {
          ...packetId,
          utteranceId: incomingTextPacket.packetId.utteranceId,
        },
        routing: {
          source: routing.targets[0],
          targets: [routing.source],
        },
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

    history.display(incomingTextPacket);
    const items = history.get();

    expect(items.length).toEqual(3);
    expect(items[0].type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
    expect(items[1].type).toEqual(CHAT_HISTORY_TYPE.NARRATED_ACTION);
    expect(items[2].type).toEqual(CHAT_HISTORY_TYPE.INTERACTION_END);
  });

  test('should display keep packets order', () => {
    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementation(() => true);

    const history = createHistoryWithPacket(
      new InworldPacket({
        packetId: {
          ...packetId,
          utteranceId: incomingTextPacket.packetId.utteranceId,
        },
        routing: {
          source: routing.targets[0],
          targets: [routing.source],
        },
        date,
        narratedAction: { text: v4() },
        type: InworldPacketType.NARRATED_ACTION,
      }),
    );

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: incomingTextPacket,
    });

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: interactionEndPacket,
    });

    expect(history.get().length).toEqual(0);

    history.display(incomingTextPacket);
    const items = history.get();

    expect(items.length).toEqual(3);
    expect(items[0].type).toEqual(CHAT_HISTORY_TYPE.NARRATED_ACTION);
    expect(items[1].type).toEqual(CHAT_HISTORY_TYPE.ACTOR);
    expect(items[2].type).toEqual(CHAT_HISTORY_TYPE.INTERACTION_END);
  });

  test("should not display packet stored in queue if it's not last one", () => {
    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementation(() => true);

    const history = createHistoryWithPacket(incomingTextPacket);

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: interactionEndPacket,
    });

    expect(history.get().length).toEqual(0);

    history.display(interactionEndPacket);

    expect(history.get().length).toEqual(0);
  });

  test('should display text packet stored in queue if not audio were received', () => {
    jest
      .spyOn(grpcAudioPlayer, 'hasPacketInQueue')
      .mockImplementation(() => false);

    const history = createHistoryWithPacket(incomingTextPacket);

    expect(history.get().length).toEqual(0);

    history.addOrUpdate({
      characters,
      grpcAudioPlayer,
      packet: interactionEndPacket,
    });

    expect(history.get().length).toEqual(2);
  });
});
