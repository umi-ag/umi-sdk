import { fetch } from 'cross-fetch';
import type { QuoteQuery, TradingRoutes } from '../types';

export const defaultEndpoint = 'https://sui-alpha.fly.dev';

export const fetchQuotesFromUmi = async ({
  sourceCoin,
  targetCoin,
  sourceAmount,
  maxHops = 2,
  maxRoutes = 1,
  endpoint = defaultEndpoint,
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
