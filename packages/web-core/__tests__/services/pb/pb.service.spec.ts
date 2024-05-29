import { PbFunc, PbService } from '../../../src/services/pb/pb.service';
import { capabilitiesProps, session } from '../../helpers';

describe('PbService', () => {
  let service: PbService;
  let mockFunc: PbFunc<any, any>;

  beforeEach(() => {
    service = new PbService();
    mockFunc = jest.fn();
  });

  test('should call the PbFunc without ssl', async () => {
    const mockConfig = {
      connection: {
        gateway: {
          hostname: 'localhost',
          ssl: false,
        },
      },
      capabilities: capabilitiesProps,
    };

    const mockReq = {};

    await service.request(mockConfig, session, mockFunc, mockReq);

    expect(mockFunc).toHaveBeenCalledWith(mockReq, {
      headers: {
        'Grpc-Metadata-session-id': session.sessionId,
        Authorization: `${session.type} ${session.token}`,
      },
      pathPrefix: 'http://localhost',
    });
  });

  test('should call the PbFunc with ssl', async () => {
    const mockConfig = {
      connection: {
        gateway: {
          hostname: 'localhost',
          ssl: true,
        },
      },
      capabilities: capabilitiesProps,
    };

    const mockReq = {};

    await service.request(mockConfig, session, mockFunc, mockReq);

    expect(mockFunc).toHaveBeenCalledWith(mockReq, {
      headers: {
        'Grpc-Metadata-session-id': session.sessionId,
        Authorization: `${session.type} ${session.token}`,
      },
      pathPrefix: 'https://localhost',
    });
  });
});
