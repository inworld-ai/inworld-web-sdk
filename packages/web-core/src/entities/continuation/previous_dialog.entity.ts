import {
  PreviousDialog as ProtoDialog,
  PreviousDialogDialogParticipant,
} from '../../../proto/ai/inworld/engine/world-engine.pb';

export enum DialogParticipant {
  UNKNOWN = 'UNKNOWN',
  PLAYER = 'PLAYER',
  CHARACTER = 'CHARACTER',
}
export interface DialogPhrase {
  talker: DialogParticipant;
  phrase: string;
}

export class DialogTalker {
  static toProto(talker: DialogParticipant) {
    switch (talker) {
      case DialogParticipant.PLAYER:
        return PreviousDialogDialogParticipant.PLAYER;
      case DialogParticipant.CHARACTER:
        return PreviousDialogDialogParticipant.CHARACTER;
      default:
        return PreviousDialogDialogParticipant.UNKNOWN;
    }
  }

  static fromProto(talker: PreviousDialogDialogParticipant) {
    switch (talker) {
      case PreviousDialogDialogParticipant.PLAYER:
        return DialogParticipant.PLAYER;
      case PreviousDialogDialogParticipant.CHARACTER:
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

  toProto(): ProtoDialog {
    const phrases = this.phrases.map((item: DialogPhrase) => ({
      talker: DialogTalker.toProto(item.talker),
      phrase: item.phrase,
    }));

    return { phrases };
  }

  static fromProto(dialog: ProtoDialog): PreviousDialog {
    return new PreviousDialog(
      dialog.phrases.map((item) => ({
        talker: DialogTalker.fromProto(item.talker),
        phrase: item.phrase,
      })),
    );
  }
}
