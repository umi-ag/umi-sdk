import type { PaginatedCoins } from '@mysten/sui.js';

export type VenueName = 'animeswap' | 'bluemoveswap' | 'cetus' | 'flameswap' | 'interestswap' | 'kriyaswap' | 'suiswap' | 'turbos' | 'bayswap' | 'deepbook';

export type Venue = {
  name: VenueName;
  object_id: string;
  object_type: string;
  source_coin_type: string;
  target_coin_type: string;
  // f64
  source_amount: number;
  // f64
  target_amount: number;
  source_fee: number;
  target_fee: number;
  is_x_to_y: boolean;
  function: `${string}::${string}::${string}`;
};

export type WeightedVenue = {
  venue: Venue;
  // f64
  weight: number;
};

export type Step = {
  source_coin_type: string;
  target_coin_type: string;
  source_amount: number;
  target_amount: number;
  venues: WeightedVenue[];
};

export type Hop = {
  source_coin_type: string;
  target_coin_type: string;
  source_amount: number;
  target_amount: number;
  steps: Step[];
};

export type WeightedHop = {
  path: Hop;
  // f64
  weight: number;
};

export type TradingRoute = {
  source_coin_type: string;
  target_coin_type: string;
  source_amount: number;
  target_amount: number;
  paths: WeightedHop[];
};

export type TradingRoutes = TradingRoute[];

export type VenueInfo = {
  venueObjectId: string,
  coinTypeX: string,
  coinTypeY: string,
};

export type VenueBook = Record<string, Record<string, VenueInfo>>;

export type QuoteQuery = {
  sourceCoin: string,
  targetCoin: string,
  sourceAmount: string | number,
  // maxHops?: number,
  // maxRoutes?: number,
  endpoint?: string,
  venueAllowList?: VenueName[],
};

export type CoinObject = PaginatedCoins['data'][number];
