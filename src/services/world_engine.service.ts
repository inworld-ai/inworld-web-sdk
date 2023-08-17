import { v4 } from 'uuid';

import * as fm from '../../proto/fetch.pb';
import { ClientRequest, WorldEngine } from '../../proto/world-engine.pb';
import { CLIENT_ID } from '../common/constants';
import {
  ExtensionLoadSceneProps,
  InternalClientConfiguration,
  SessionToken,
  User,
} from '../common/data_structures';
import { SessionContinuation } from '../entities/continuation/session_continuation.entity';

const INWORLD_USER_ID = 'inworldUserId';

type PbFunc<P, R> = (req: P, initReq?: fm.InitReq) => Promise<R>;

export interface LoadSceneProps {
  name: string;
  client?: ClientRequest;
  user?: User;
  config: InternalClientConfiguration;
  session: SessionToken;
  sessionContinuation?: SessionContinuation;
  sceneProps?: ExtensionLoadSceneProps;
}

export class WorldEngineService {
  async loadScene(props: LoadSceneProps) {
    const {
      client,
      config,
      name,
      sceneProps,
      session,
      sessionContinuation,
      user,
    } = props;
    const { hostname, ssl } = config.connection.gateway;
    const { id, fullName, profile } = user;

    const url = `${ssl ? 'https' : 'http'}://${hostname}`;

    return this.engineSessionRequest(url, session, WorldEngine.LoadScene, {
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
      ...sceneProps,
    });
  }

  private engineSessionRequest = async <P, R>(
    pathPrefix: string,
    session: SessionToken,
    pb: PbFunc<P, R>,
    req: P,
  ) => {
    const params = {
      headers: {
        ...(session.sessionId && {
          'Grpc-Metadata-session-id': session.sessionId,
        }),
        ...(session.type &&
          session.token && {
            Authorization: `${session.type} ${session.token}`,
          }),
      },
      pathPrefix,
    };

    return pb(req, params);
  };

  private getUserId() {
    let id = localStorage.getItem(INWORLD_USER_ID);

    if (!id) {
      id = v4();
      localStorage.setItem(INWORLD_USER_ID, id);
    }

    return id;
  }
}
