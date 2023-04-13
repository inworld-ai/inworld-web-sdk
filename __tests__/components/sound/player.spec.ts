import '../../mocks/window.mock';

import { Player } from '../../../src/components/sound/player';

beforeEach(() => {
  jest.clearAllMocks();
});

test('should initialize instance once', () => {
  const player1 = Player.getInstance();
  const player2 = Player.getInstance();

  expect(player1).toEqual(player2);
});

describe('work with player', () => {
  let player: Player;

  beforeEach(() => {
    jest.clearAllMocks();

    player = Player.getInstance();
  });

  test('should set mute player as true', () => {
    player.setMute(true);

    expect(player.getMute()).toEqual(true);
  });

  test('should set stream', () => {
    const stream = new MediaStream();

    const play = jest
      .spyOn(HTMLAudioElement.prototype, 'play')
      .mockImplementationOnce(jest.fn());

    player.setStream(stream);

    expect(play).toHaveBeenCalledTimes(1);
  });

  test('shoud play workaround sound', () => {
    const play = jest
      .spyOn(HTMLAudioElement.prototype, 'play')
      .mockImplementationOnce(jest.fn());

    player.playWorkaroundSound();

    expect(play).toHaveBeenCalledTimes(1);
  });
});
