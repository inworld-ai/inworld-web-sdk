export const protoTimestamp = (date?: Date) =>
  (date ?? new Date()).toISOString();

export const isIOSMobile = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent);

export const interpolate = (p: number): number =>
  0.5 - Math.cos(p * Math.PI) / 2;

export const safeJSONParse = <T = any>(str: string): T | undefined => {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
};

export const objectsAreEqual = <T>(a: T, b: T, keys: (keyof T)[]) => {
  for (const key of keys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
};

export const calculateTimeDifference = (from: Date, to: Date) => {
  const durationMilliseconds = to.getTime() - from.getTime();
  let seconds = Math.floor(durationMilliseconds / 1000);
  let nanos = Math.round((durationMilliseconds / 1000 - seconds) * 1000000000);

  if (seconds < 0 && nanos > 0) {
    seconds += 1;
    nanos -= 1000000000;
  } else if (seconds > 0 && nanos < 0) {
    seconds -= 1;
    nanos += 1000000000;
  }

  return { seconds, nanos };
};
