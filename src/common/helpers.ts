export const protoTimestamp = (date?: Date) =>
  (date || new Date()).toISOString();
