const TIME_DIFF_MS = 50 * 60 * 1000; // 5 minutes

export interface SessionTokenProps {
  token: string;
  type: string;
  expirationTime: string;
  sessionId: string;
}

export class SessionToken {
  token: string;
  type: string;
  expirationTime: string;
  sessionId: string;

  constructor(props: SessionTokenProps) {
    this.token = props.token;
    this.type = props.type;
    this.expirationTime = props.expirationTime;
    this.sessionId = props.sessionId;
  }

  static isExpired(token: SessionToken) {
    const expirationTime = token.expirationTime;

    return (
      new Date(expirationTime).getTime() - new Date().getTime() <= TIME_DIFF_MS
    );
  }
}
