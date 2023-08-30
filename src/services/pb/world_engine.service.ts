import { v4 } from 'uuid';

import {
  ClientRequest,
  LoadSceneRequest,
  WorldEngine,
} from '../../../proto/world-engine.pb';
import { CLIENT_ID } from '../../common/constants';
import {
  Extension,
  InternalClientConfiguration,
  SessionToken,
  User,
} from '../../common/data_structures';
import { SessionContinuation } from '../../entities/continuation/session_continuation.entity';
import { PbService } from './pb.service';

const INWORLD_USER_ID = 'inworldUserId';

export interface LoadSceneProps<InworldPacketT> {
  name: string;
  client?: ClientRequest;
  user?: User;
  config: InternalClientConfiguration;
  session: SessionToken;
  sessionContinuation?: SessionContinuation;
  extension?: Extension<InworldPacketT>;
}

export class WorldEngineService<InworldPacketT> extends PbService {
  async loadScene(props: LoadSceneProps<InworldPacketT>) {
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
    props: LoadSceneProps<InworldPacketT>,
  ): LoadSceneRequest {
    const { client, config, name, sessionContinuation, user = {} } = props;
    const { id, fullName, profile } = user;

    return {
      client: {
        id: CLIENT_ID,
        ...client,
      },
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
      ...(sessionContinuation?.previousDialog && {
        sessionContinuation: {
          previousDialog: sessionContinuation.previousDialog.toProto(),
        },
      }),
    };
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
