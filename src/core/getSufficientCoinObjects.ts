import type { JsonRpcProvider } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { err, ok } from 'neverthrow';
import type { CoinObject } from '../types';

export const getSufficientCoinObjects = async (
  provider: JsonRpcProvider,
  owner: string,
  coinType: string,
  requiredAmount: number | string,
) => {
  const coins: CoinObject[] = [];
  const totalBalance = () => coins.reduce((sub, cur) => sub.plus(cur.balance), new Decimal(0));

  let cursor;
  let hasNextPage = true;
  while (totalBalance().lt(requiredAmount) && hasNextPage) {
    const page = (await provider.getCoins({ owner, coinType, cursor }));
    cursor = page.nextCursor;
    hasNextPage = page.hasNextPage;
    coins.push(...page.data);
  }

  if (totalBalance().lt(requiredAmount)) {
    return err('Insufficient coin objects available for the signer to meet the required amount.');
  }

  return ok(coins);
};
