import { v4 } from 'uuid';

import { ClientRequest, WorldEngine } from '../../../proto/world-engine.pb';
import { CLIENT_ID } from '../../common/constants';
import {
  ExtensionLoadSceneProps,
  InternalClientConfiguration,
  SessionToken,
  User,
} from '../../common/data_structures';
import { PbService } from './pb.service';

const INWORLD_USER_ID = 'inworldUserId';

export interface LoadSceneProps {
  name: string;
  client?: ClientRequest;
  user?: User;
  config: InternalClientConfiguration;
  session: SessionToken;
  sceneProps?: ExtensionLoadSceneProps;
}

export class WorldEngineService extends PbService {
  async loadScene(props: LoadSceneProps) {
    const { client, config, name, sceneProps, session, user } = props;
    const { id, fullName, profile } = user;

    return this.request(config, session, WorldEngine.LoadScene, {
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
      ...sceneProps,
    });
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
