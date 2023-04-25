import type { JsonRpcProvider } from '@mysten/sui.js';
import { fetchQuotes } from './api';
import type { QuoteQuery } from './types';
import { makeTradeTransactionBlock } from './utils/makeTransactionBlock';

export const getBestTradeTransactionBlock = async (
  provider: JsonRpcProvider,
  query: QuoteQuery,
  slippageTolerance: number,
) => {
  const route = await fetchQuotes(query);

  const coins = await provider.getCoins({ owner: '', coinType: query.sourceCoin });
  const txb = makeTradeTransactionBlock(route, slippageTolerance, coins.data);

  return txb;
};

export {
  fetchQuotes,
  makeTradeTransactionBlock,
};
