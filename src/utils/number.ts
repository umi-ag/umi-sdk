import Decimal from 'decimal.js';

export const toBps = (value: number) => {
  return new Decimal(value)
    .mul(10000)
    .round()
    .toNumber();
};
