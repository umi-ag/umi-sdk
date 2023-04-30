import type { JsonRpcProvider, PaginatedCoins, SignerWithProvider, SuiAddress } from '@mysten/sui.js';

export type Venue = {
  name: string;
  object_id: string;
  object_type: string;
  source_coin: string;
  target_coin: string;
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
  source_coin: string;
  target_coin: string;
  source_amount: number;
  target_amount: number;
  venues: WeightedVenue[];
};

export type Chain = {
  source_coin: string;
  target_coin: string;
  source_amount: number;
  target_amount: number;
  steps: Step[];
};

export type WeightedChain = {
  chain: Chain;
  // f64
  weight: number;
};

export type TradingRoute = {
  source_coin: string;
  target_coin: string;
  source_amount: number;
  target_amount: number;
  chains: WeightedChain[];
};

export type TradingRoutes = TradingRoute[];

export type VenueInfo = {
  venueObjectId: string,
  coinXType: string,
  coinYType: string,
};

export type VenueBook = Record<string, Record<string, VenueInfo>>;

export type QuoteQuery = {
  sourceCoin: string,
  targetCoin: string,
  sourceCoinAmount: string | number,
  maxHops?: number,
  maxRoutes?: number,
  endpoint?: `https://${string}`,
};

export type CoinObject = PaginatedCoins['data'][number];

export type UmiSdkArg = {
  provider?: JsonRpcProvider,
  signer?: SignerWithProvider,
  userAddress: SuiAddress,
};

export type SwapConfig = {
  slippageTolerance: number,
};
