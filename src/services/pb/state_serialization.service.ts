import { StateSerialization } from '../../../proto/state_serialization.pb';
import { SCENE_PATTERN } from '../../common/constants';
import {
  InternalClientConfiguration,
  SessionToken,
} from '../../common/data_structures';
import { PbService } from './pb.service';

export interface getSessionStateProps {
  config: InternalClientConfiguration;
  session: SessionToken;
  scene: string;
}

export class StateSerializationService extends PbService {
  public async getSessionState(props: getSessionStateProps) {
    const { config, session, scene } = props;

    const workspace = SCENE_PATTERN.exec(scene)[1];
    const name = `workspaces/${workspace}/sessions/${session.sessionId}`;

    return this.request(config, session, StateSerialization.GetSessionState, {
      name,
    });
  }
}
