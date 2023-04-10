window.MediaStream = jest.fn().mockImplementation(() => ({
  addTrack: jest.fn(() => []),
}));

window.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamDestination: jest.fn(),
  decodeAudioData: jest.fn(),
}));

window.AudioBufferSourceNode = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
}));
