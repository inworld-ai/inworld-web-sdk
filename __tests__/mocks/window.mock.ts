window.MediaStream = jest.fn().mockImplementation(() => ({
  addTrack: jest.fn(() => []),
  getTracks: jest.fn(() => [new MediaStreamTrack(), new MediaStreamTrack()]),
}));

window.MediaStreamTrack = jest.fn().mockImplementation(() => ({
  stop: jest.fn(),
}));

window.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamDestination: jest.fn().mockImplementation(() => ({
    stream: new MediaStream(),
  })),
  createMediaStreamSource: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
  })),
  createScriptProcessor: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
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
  onended: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
}));

// @ts-ignore
window.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  addTrack: jest.fn(),
  createOffer: jest.fn().mockImplementation(() => Promise.resolve({})),
  setRemoteDescription: jest.fn().mockImplementation(() => Promise.resolve()),
  createAnswer: jest.fn().mockImplementation(() => Promise.resolve({})),
  setLocalDescription: jest.fn().mockImplementation(() => Promise.resolve()),
  ontrack: jest.fn(),
  close: jest.fn(),
}));
