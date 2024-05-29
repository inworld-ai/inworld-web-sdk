import { v4 } from 'uuid';

import { protoTimestamp } from '../../src/common/helpers';
import { SessionToken } from '../../src/entities/session_token.entity';

const inOneHours = new Date();
inOneHours.setHours(inOneHours.getHours() + 1);

export const session: SessionToken = {
  sessionId: v4(),
  token: v4(),
  type: 'Bearer',
  expirationTime: protoTimestamp(inOneHours),
};

export const generateSessionToken = () => Promise.resolve(session);
