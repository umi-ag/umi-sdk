import { fetch } from 'cross-fetch';
import { DEFAULT_ALLOW_LIST_VENUE_NAME, DEFAULT_ENDPOINT } from '../config';
import type { QuoteQuery, TradingRoutes } from '../types';

export const fetchQuoteFromUmi = async ({
  sourceCoin,
  targetCoin,
  sourceAmount,
  // maxHops = 2,
  // maxRoutes = 1,
  endpoint = DEFAULT_ENDPOINT,
  venueAllowList = DEFAULT_ALLOW_LIST_VENUE_NAME,
}: QuoteQuery): Promise<TradingRoutes> => {
  const url = new URL(`${endpoint}/quote`);
  url.searchParams.append('source_coin', sourceCoin);
  url.searchParams.append('target_coin', targetCoin);
  url.searchParams.append('source_amount', sourceAmount.toString());
  url.searchParams.append('venue_allow_list', venueAllowList.join(','));

  // console.log(url.toString());

  const response = await fetch(url.toString());
  const result = await response.json();

  return result;
};

export const fetchQuoteX = async ({
  sourceCoin,
  targetCoin,
  sourceAmount,
  // maxHops = 2,
  // maxRoutes = 1,
  endpoint = DEFAULT_ENDPOINT,
  venueAllowList = DEFAULT_ALLOW_LIST_VENUE_NAME,
}: QuoteQuery): Promise<TradingRoutes> => {
  const url = new URL(`${endpoint}/quote_x`);
  url.searchParams.append('source_coin', sourceCoin);
  url.searchParams.append('target_coin', targetCoin);
  url.searchParams.append('source_amount', sourceAmount.toString());
  url.searchParams.append('venue_allow_list', venueAllowList.join(','));

  // console.log(url.toString());

  const response = await fetch(url.toString());
  const result = await response.json();

  return result;
};

export const _fetchQuotesFromUmi = async ({
  sourceCoin,
  targetCoin,
  sourceAmount,
  // maxHops = 2,
  // maxRoutes = 1,
  endpoint = DEFAULT_ENDPOINT,
  venueAllowList = DEFAULT_ALLOW_LIST_VENUE_NAME,
}: QuoteQuery): Promise<TradingRoutes> => {
  const url = new URL(`${endpoint}/quote`);
  url.searchParams.append('source_coin', sourceCoin);
  url.searchParams.append('target_coin', targetCoin);
  url.searchParams.append('source_amount', sourceAmount.toString());
  // url.searchParams.append('max_paths', maxHops.toString());
  // url.searchParams.append('max_routes', maxRoutes.toString());
  url.searchParams.append('venue_allow_list', venueAllowList.join(','));

  // console.log(url.toString());

  const response = await fetch(url.toString());
  const result = await response.json();

  return result;
};
