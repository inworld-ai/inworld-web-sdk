import {
  AdditionalPhonemeInfo,
  AudioPlaybackConfig,
  Capabilities,
  HistoryItem,
  InworldClient,
  InworldConnectionService,
  InworldPacket,
  SessionContinuationProps,
} from '@inworld/web-core';

import { Config } from '../config';

interface InworldServiceProps {
  audioPlayback?: AudioPlaybackConfig;
  capabilities: Capabilities;
  continuation?: SessionContinuationProps;
  sceneName: string;
  playerName: string;
  onReady: () => void;
  onPhoneme: (phonemeData: AdditionalPhonemeInfo[]) => void;
  onMessage: (inworldPacket: InworldPacket) => void;
  onHistoryChange: (history: HistoryItem[]) => void;
  onDisconnect: () => void;
}

export class InworldService {
  connection: InworldConnectionService;

  constructor(props: InworldServiceProps) {
    const client = new InworldClient()
      .setConfiguration({
        ...(Config.CONNECTION_HOSTNAME && {
          connection: {
            gateway: {
              hostname: Config.CONNECTION_HOSTNAME,
              ssl: Config.CONNECTION_SSL,
            },
          },
        }),
        capabilities: props.capabilities,
        audioPlayback: props.audioPlayback,
      })
      .setUser({ fullName: props.playerName })
      .setScene(props.sceneName)
      .setGenerateSessionToken(this.generateSessionToken)
      .setOnError((err) => console.log(err))
      .setOnReady(props.onReady)
      .setOnMessage(props.onMessage)
      .setOnPhoneme(props.onPhoneme)
      .setOnHistoryChange(props.onHistoryChange)
      .setOnDisconnect(props.onDisconnect);

    if (props.continuation) {
      client.setSessionContinuation(props.continuation);
    }

    this.connection = client.build();
  }

  private async generateSessionToken() {
    const response = await fetch(Config.GENERATE_TOKEN_URL);

    return response.json();
  }
}
