export const protoTimestamp = (date?: Date) =>
  (date || new Date()).toISOString();

export const isIOSMobile = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};
