export interface SessionContinuationProps {
  previousState?: Uint8Array;
}

export class SessionContinuation {
  readonly previousState: Uint8Array | undefined;

  constructor(props: SessionContinuationProps) {
    this.previousState = props.previousState;
  }
}
