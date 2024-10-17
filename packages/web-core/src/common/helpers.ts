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
