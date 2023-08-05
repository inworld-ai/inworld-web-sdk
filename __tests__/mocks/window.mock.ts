window.MediaStream = jest.fn().mockImplementation(() => ({
  addTrack: jest.fn(() => []),
}));

window.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamDestination: jest.fn(),
  decodeAudioData: jest.fn().mockImplementation(() =>
    Promise.resolve({
      duration: 1,
    }),
  ),
  createGain: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    gain: { value: 1 },
  })),
}));

window.AudioBufferSourceNode = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
}));
