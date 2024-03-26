import {
  Actor,
  ActorType,
  DialogHistory,
  DialogHistoryHistoryItem,
} from '../../../proto/ai/inworld/packets/packets.pb';

export enum DialogParticipant {
  UNKNOWN = 'UNKNOWN',
  PLAYER = 'PLAYER',
  CHARACTER = 'CHARACTER',
}
export interface DialogPhrase {
  talker: DialogParticipant;
  phrase: string;
}

export class DialogActor {
  static toProto(talker: DialogParticipant) {
    switch (talker) {
      case DialogParticipant.PLAYER:
        return { type: ActorType.PLAYER } as Actor;
      case DialogParticipant.CHARACTER:
        return { type: ActorType.AGENT } as Actor;
      default:
        return { type: ActorType.UNKNOWN } as Actor;
    }
  }

  static fromProto(actor: Actor) {
    switch (actor.type) {
      case ActorType.PLAYER:
        return DialogParticipant.PLAYER;
      case ActorType.AGENT:
        return DialogParticipant.CHARACTER;
      default:
        return DialogParticipant.UNKNOWN;
    }
  }
}

export class PreviousDialog {
  private phrases: DialogPhrase[];

  constructor(phrases: DialogPhrase[]) {
    this.phrases = phrases;
  }

  toProto(): DialogHistory {
    const history = this.phrases.map(
      (item: DialogPhrase) =>
        ({
          actor: DialogActor.toProto(item.talker),
          text: item.phrase,
        }) as DialogHistoryHistoryItem,
    );

    return { history };
  }

  static fromProto(dialog: DialogHistory): PreviousDialog {
    return new PreviousDialog(
      dialog.history.map((item) => ({
        talker: DialogActor.fromProto(item.actor),
        phrase: item.text,
      })),
    );
  }
}
