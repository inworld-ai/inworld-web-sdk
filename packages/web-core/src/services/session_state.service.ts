import { SessionState } from '../../proto/ai/inworld/engine/v1/state_serialization.pb';
import {
  DEFAULT_SESSION_STATE_ATTEMPTS_INTERVAL,
  DEFAULT_SESSION_STATE_INTERVAL,
  DEFAULT_SESSION_STATE_KEY,
  DEFAULT_SESSION_STATE_MAX_ATTEMPTS,
} from '../common/constants';
import { safeJSONParse } from '../common/helpers';
import { CHAT_HISTORY_TYPE } from '../components/history';
import { InworldPacket } from '../entities/packets/inworld_packet.entity';
import { ConnectionService } from './connection.service';
import { StateSerializationService } from './wrappers/state_serialization.service';

export class SessionStateService<
  InworldPacketT extends InworldPacket = InworldPacket,
> {
  private connection: ConnectionService;
  private stateSerialization: StateSerializationService<InworldPacketT>;

  // Try to save session state every N milliseconds is user is active.
  // See DEFAULT_SESSION_STATE_INTERVAL.
  private autoSaveIntervalId: NodeJS.Timeout | undefined;
  private maxAttempts = DEFAULT_SESSION_STATE_MAX_ATTEMPTS;

  private interactionEndTimeout: NodeJS.Timeout | undefined;

  private isBlurred = false;
  private isSaving = false;

  constructor(
    connection: ConnectionService,
    stateSerialization: StateSerializationService<InworldPacketT>,
  ) {
    this.connection = connection;
    this.stateSerialization = stateSerialization;

    window.addEventListener('blur', this.onWindowBlur.bind(this));
    window.addEventListener('focus', this.onWindowFocus.bind(this));

    this.setAutoSaveInterval();
  }

  clear() {
    sessionStorage.removeItem(DEFAULT_SESSION_STATE_KEY);
  }

  destroy() {
    this.clear();
    this.clearAutoSaveInterval();
    this.clearInteractionEndTimeout();

    window.removeEventListener('blur', this.onWindowBlur.bind(this));
    window.removeEventListener('focus', this.onWindowFocus.bind(this));
  }

  static loadSessionState() {
    return sessionStorage.getItem(DEFAULT_SESSION_STATE_KEY);
  }

  private onWindowBlur() {
    this.isBlurred = true;

    this.clearAutoSaveInterval();
    this.tryToSaveState();
  }

  private onWindowFocus() {
    this.isBlurred = false;

    this.setAutoSaveInterval();
  }

  private tryToSaveState() {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    const history = this.connection.getHistory();
    const lastItem = history[history.length - 1];
    const saved = SessionStateService.loadSessionState();
    const sessionState = saved ? safeJSONParse<SessionState>(saved) : undefined;

    // Don't save session state if it's already saved.
    if (
      !lastItem ||
      (lastItem.interactionId &&
        lastItem.interactionId === sessionState?.version?.interactionId)
    ) {
      this.isSaving = false;
      return;
    }

    let attempts = 0;

    const save = () => {
      this.interactionEndTimeout = setTimeout(
        async () => {
          this.clearInteractionEndTimeout();

          attempts++;

          const history = this.connection.getHistory();
          const lastItem = history[history.length - 1];

          // Try to wait for interaction end event before saving session state.
          // If all attempts are failed, just save session state here.
          // Or save session state if last item in history is interaction end event.
          if (
            attempts > this.maxAttempts ||
            lastItem?.type === CHAT_HISTORY_TYPE.INTERACTION_END
          ) {
            await this.saveSessionState();
            this.isSaving = false;
            return;
          } else if (attempts <= this.maxAttempts) {
            save();
          }
        },
        DEFAULT_SESSION_STATE_ATTEMPTS_INTERVAL * (attempts + 1) +
          DEFAULT_SESSION_STATE_ATTEMPTS_INTERVAL *
            Math.pow(2, attempts) *
            attempts,
      );
    };

    save();
  }

  private async saveSessionState() {
    this.clearAutoSaveInterval();

    try {
      const sessionState = await this.stateSerialization.get();

      if (sessionState?.state) {
        sessionStorage.setItem(
          DEFAULT_SESSION_STATE_KEY,
          JSON.stringify(sessionState),
        );
      }
    } catch (e) {}
  }

  private setAutoSaveInterval() {
    this.clearAutoSaveInterval();
    this.autoSaveIntervalId = setInterval(() => {
      if (!this.isBlurred) {
        this.tryToSaveState();
      }
    }, DEFAULT_SESSION_STATE_INTERVAL);
  }

  private clearAutoSaveInterval() {
    clearInterval(this.autoSaveIntervalId);

    this.autoSaveIntervalId = undefined;
  }

  private clearInteractionEndTimeout() {
    clearTimeout(this.interactionEndTimeout);

    this.interactionEndTimeout = undefined;
  }
}
