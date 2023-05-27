export const dateWithMilliseconds = (date: Date) =>
  `${date.toLocaleString()}.${date.getMilliseconds()}`;

export const toInt = (value: string | number) => {
  if (typeof value === 'number') return value;

  const parsed = parseInt(value) ?? undefined;

  return isNaN(parsed) ? undefined : parsed;
};
