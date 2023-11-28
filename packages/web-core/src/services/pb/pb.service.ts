import * as fm from '../../../proto/fetch.pb';
import { InternalClientConfiguration } from '../../common/data_structures';
import { SessionToken } from '../../entities/session_token.entity';

export type PbFunc<P, R> = (req: P, initReq?: fm.InitReq) => Promise<R>;

export class PbService {
  request = async <P, R>(
    config: InternalClientConfiguration,
    session: SessionToken,
    pb: PbFunc<P, R>,
    req: P,
  ) => {
    const { hostname, ssl } = config.connection.gateway;

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
      pathPrefix: `${ssl ? 'https' : 'http'}://${hostname}`,
    };

    return pb(req, params);
  };
}
