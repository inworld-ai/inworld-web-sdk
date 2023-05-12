import * as fm from '../../proto/fetch.pb';
import {
  ClientRequest,
  UserRequest,
  WorldEngine,
} from '../../proto/world-engine.pb';
import { CLIENT_ID } from '../common/constants';
import {
  ExtensionLoadSceneProps,
  InternalClientConfiguration,
  SessionToken,
} from '../common/data_structures';

type PbFunc<P, R> = (req: P, initReq?: fm.InitReq) => Promise<R>;

export interface LoadSceneProps {
  name: string;
  client?: ClientRequest;
  user?: UserRequest;
  config: InternalClientConfiguration;
  session: SessionToken;
  sceneProps?: ExtensionLoadSceneProps;
}

export class WorldEngineService {
  async loadScene(props: LoadSceneProps) {
    const { client, config, name, sceneProps, session, user } = props;
    const { hostname, ssl } = config.connection.gateway;

    const url = `${ssl ? 'https' : 'http'}://${hostname}`;

    return this.engineSessionRequest(url, session, WorldEngine.LoadScene, {
      client: {
        id: CLIENT_ID,
        ...client,
      },
      name,
      user,
      capabilities: config.capabilities,
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
}
