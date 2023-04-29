import { fetch } from 'cross-fetch';
import type { QuoteQuery, TradingRoutes } from '../types';

// @ts-ignore
const endpoint = import.meta.env.VITE_APP_UMI_API_ENDPOINT;

export const fetchQuotes = async ({
  sourceCoin,
  targetCoin,
  sourceCoinAmount: inputAmount,
  maxHops = 2,
  maxRoutes = 3,
}: QuoteQuery): Promise<TradingRoutes> => {
  const url = new URL(`${endpoint}/quote`);
  url.searchParams.append('source_coin', sourceCoin);
  url.searchParams.append('target_coin', targetCoin);
  url.searchParams.append('source_amount', inputAmount.toString());
  url.searchParams.append('max_hops', maxHops.toString());
  url.searchParams.append('max_routes', maxRoutes.toString());

  const response = await fetch(url.toString());
  const result = await response.json();

  return result;
};
