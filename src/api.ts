import { fetch } from 'cross-fetch';
import type { QuoteQuery, TradingRoute } from './types';

export const fetchQuotes = async ({
  sourceCoin,
  targetCoin,
  inputAmount,
  maxHops = 2,
  maxRoutes = 3,
}: QuoteQuery): Promise<TradingRoute[]> => {
  const url = new URL('https://quiet-sun-2393.fly.dev/quotes');
  url.searchParams.append('source_coin', sourceCoin);
  url.searchParams.append('target_coin', targetCoin);
  url.searchParams.append('input_amount', inputAmount);
  url.searchParams.append('max_hops', maxHops.toString());
  url.searchParams.append('max_routes', maxRoutes.toString());

  const response = await fetch(url.toString());
  const result = await response.json();

  return result;
};
