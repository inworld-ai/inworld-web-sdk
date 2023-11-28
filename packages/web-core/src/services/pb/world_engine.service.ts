import { v4 } from 'uuid';

import {
  ClientRequest,
  LoadSceneRequest,
  WorldEngine,
} from '../../../proto/ai/inworld/engine/world-engine.pb';
import { CLIENT_ID } from '../../common/constants';
import {
  Extension,
  InternalClientConfiguration,
  User,
} from '../../common/data_structures';
import { HistoryItem } from '../../components/history';
import { SessionContinuation } from '../../entities/continuation/session_continuation.entity';
import { InworldPacket } from '../../entities/inworld_packet.entity';
import { SessionToken } from '../../entities/session_token.entity';
import { PbService } from './pb.service';

const { version } = require('../../../package.json');

const INWORLD_USER_ID = 'inworldUserId';

export interface LoadSceneProps<InworldPacketT, HistoryItemT> {
  name: string;
  client?: ClientRequest;
  user?: User;
  config: InternalClientConfiguration;
  session: SessionToken;
  sessionContinuation?: SessionContinuation;
  extension?: Extension<InworldPacketT, HistoryItemT>;
}

export class WorldEngineService<
  InworldPacketT extends InworldPacket = InworldPacket,
  HistoryItemT extends HistoryItem = HistoryItem,
> extends PbService {
  async loadScene(props: LoadSceneProps<InworldPacketT, HistoryItemT>) {
    const req = this.buildRequest(props);
    const finalReq = props.extension?.beforeLoadScene?.(req) ?? req;

    const res = await this.request(
      props.config,
      props.session,
      WorldEngine.LoadScene,
      finalReq,
    );

    props.extension?.afterLoadScene?.(res);

    return res;
  }

  private buildRequest(
    props: LoadSceneProps<InworldPacketT, HistoryItemT>,
  ): LoadSceneRequest {
    const {
      config,
      name,
      sessionContinuation: {
        previousDialog,
        previousState,
      } = {} as SessionContinuation,
      user = {},
    } = props;
    const { id, fullName, profile } = user;

    return {
      client: this.getClient(props),
      name,
      user: {
        id: id ? id : this.getUserId(),
        ...(fullName && { name: fullName }),
      },
      capabilities: config.capabilities,
      ...(profile?.fields.length && {
        userSettings: {
          playerProfile: {
            fields: profile.fields.map(
              ({ id: fieldId, value: fieldValue }) => ({ fieldId, fieldValue }),
            ),
          },
        },
      }),
      ...((previousDialog || previousState) && {
        sessionContinuation: {
          ...(previousDialog && { previousDialog: previousDialog.toProto() }),
          ...(previousState && {
            previousState: previousState as unknown as Uint8Array,
          }),
        },
      }),
    };
  }

  private getClient(props: LoadSceneProps<InworldPacketT, HistoryItemT>) {
    const description = [CLIENT_ID, version, navigator.userAgent];

    if (props.client?.id) {
      description.push(props.client.id);
    }

    return {
      id: CLIENT_ID,
      version,
      description: description.join('; '),
    } as ClientRequest;
  }

  private getUserId() {
    let id = localStorage.getItem(INWORLD_USER_ID);

    if (!id) {
      id = v4();
      localStorage.setItem(INWORLD_USER_ID, id);
    }

    return id;
  }
}
