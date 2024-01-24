import '../../mocks/window.mock';

import { Player } from '../../../src/components/sound/player';

test('should initialize instance once', () => {
  const player1 = Player.getInstance();
  const player2 = Player.getInstance();

  expect(player1).toEqual(player2);
});

describe('work with player', () => {
  let player: Player;

  beforeEach(() => {
    jest.resetModules();

    player = Player.getInstance();
  });

  test('should set stream', () => {
    const stream = new MediaStream();

    const play = jest
      .spyOn(HTMLAudioElement.prototype, 'play')
      .mockImplementationOnce(jest.fn());

    player.setStream(stream);

    expect(play).toHaveBeenCalledTimes(1);
  });

  test('should set track on provided stream', () => {
    const stream = new MediaStream();
    const track = new MediaStreamTrack();

    jest
      .spyOn(HTMLAudioElement.prototype, 'play')
      .mockImplementationOnce(jest.fn());

    const addTrack = jest.spyOn(stream, 'addTrack');

    player.setStream(stream);
    player.setTrack(track);

    expect(addTrack.mock.calls.length).toEqual(1);
  });

  test('should set track on default stream', () => {
    const { Player } = require('../../../src/components/sound/player');

    const player = Player.getInstance();
    const track = new MediaStreamTrack();

    player.setTrack(track);
  });

  test('shoud play workaround sound', () => {
    const play = jest
      .spyOn(HTMLAudioElement.prototype, 'play')
      .mockImplementationOnce(jest.fn());

    player.playWorkaroundSound();

    expect(play).toHaveBeenCalledTimes(1);
  });
});
