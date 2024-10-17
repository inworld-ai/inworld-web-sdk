import { StateSerialization } from '../../../proto/ai/inworld/engine/v1/state_serialization.pb';
import { SCENE_PATTERN } from '../../common/constants';
import {
  InternalClientConfiguration,
  SessionState,
} from '../../common/data_structures';
import { SessionToken } from '../../entities/session_token.entity';
import { PbService } from './pb.service';

export interface getSessionStateProps {
  config: InternalClientConfiguration;
  session: SessionToken;
  scene: string;
}

export class StateSerializationService extends PbService {
  async getSessionState(props: getSessionStateProps) {
    const { config, session, scene } = props;

    const workspace = SCENE_PATTERN.exec(scene)[1];
    const name = `workspaces/${workspace}/sessions/${session.sessionId}`;

    const res = await this.request(
      config,
      session,
      StateSerialization.GetSessionState,
      {
        name,
      },
    );

    return {
      state: res.state?.toString(),
      creationTime: res.creationTime?.toString(),
      ...(res.version?.interactionId && {
        version: {
          interactionId: res.version.interactionId,
        },
      }),
    } as SessionState;
  }
}
