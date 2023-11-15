export const protoTimestamp = (date?: Date) =>
  (date ?? new Date()).toISOString();

export const isIOSMobile = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent);

export const interpolate = (p: number): number =>
  0.5 - Math.cos(p * Math.PI) / 2;
