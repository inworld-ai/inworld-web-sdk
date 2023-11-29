import { DialogPhrase } from '@inworld/web-core';

export const dateWithMilliseconds = (date: Date) =>
  `${date.toLocaleString()}.${date.getMilliseconds()}`;

export const toInt = (value: string | number) => {
  if (typeof value === 'number') return value;

  const parsed = parseInt(value) ?? undefined;

  return isNaN(parsed) ? undefined : parsed;
};

export const JSONToPreviousDialog = (json: string) => {
  const data = json ? JSON.parse(json) : [];

  return data.map(({ talker, phrase }: { talker: string; phrase: string }) => ({
    talker,
    phrase,
  })) as DialogPhrase[];
};
