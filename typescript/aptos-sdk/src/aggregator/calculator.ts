export const calcMinAmount = (coin: number, slippageTolerance: number) => {
  const minAmount = coin * (1 - slippageTolerance);

  return Math.round(minAmount).toString();
};