import { DialogPhrase, PreviousDialog } from './previous_dialog.entity';

export interface SessionContinuationProps {
  previousDialog?: DialogPhrase[];
  previousState?: string;
}

export class SessionContinuation {
  readonly previousDialog: PreviousDialog | undefined;
  readonly previousState: string | undefined;

  constructor(props: SessionContinuationProps) {
    if (props.previousDialog) {
      this.previousDialog = new PreviousDialog(props.previousDialog);
    }

    this.previousState = props.previousState;
  }
}
