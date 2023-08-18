import { DialogPhrase, PreviousDialog } from './previous_dialog.entity';

export interface SessionContinuationProps {
  previousDialog?: DialogPhrase[];
  previousState?: Uint8Array;
}

export class SessionContinuation {
  readonly previousDialog: PreviousDialog | undefined;
  readonly previousState: Uint8Array | undefined;

  constructor(props: SessionContinuationProps) {
    this.previousDialog = new PreviousDialog(props.previousDialog);
    this.previousState = props.previousState;
  }
}
