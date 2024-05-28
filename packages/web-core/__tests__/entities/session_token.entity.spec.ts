import { SessionToken } from '../../src/entities/session_token.entity';
import { session } from '../helpers/index';

test('should get token fields', () => {
  const token = new SessionToken(session);

  expect(token.token).toEqual(session.token);
  expect(token.type).toEqual(session.type);
  expect(token.expirationTime).toEqual(session.expirationTime);
  expect(token.sessionId).toEqual(session.sessionId);
});
