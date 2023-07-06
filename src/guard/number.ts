export const isNaturalNumber = (value: number) => {
  if (typeof value !== 'number') return false;

  return value > 0 && Math.floor(value) === +value;
};
