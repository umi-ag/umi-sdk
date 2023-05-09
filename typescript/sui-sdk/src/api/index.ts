import { fetch } from 'cross-fetch';
import { DEFAULT_ENDPOINT } from '../config';
import type { QuoteQuery, TradingRoutes } from '../types';


export const fetchQuotesFromUmi = async ({
  sourceCoin,
  targetCoin,
  sourceAmount,
  maxHops = 2,
  maxRoutes = 1,
  endpoint = DEFAULT_ENDPOINT,
}: QuoteQuery): Promise<TradingRoutes> => {
  const url = new URL(`${endpoint}/quote`);
  url.searchParams.append('source_coin', sourceCoin);
  url.searchParams.append('target_coin', targetCoin);
  url.searchParams.append('source_amount', sourceAmount.toString());
  url.searchParams.append('max_paths', maxHops.toString());
  url.searchParams.append('max_routes', maxRoutes.toString());

  const response = await fetch(url.toString());
  const result = await response.json();

  return result;
};
