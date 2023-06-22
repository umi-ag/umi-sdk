export type VenueName = 'anime' | 'pontem' | 'aptoswapnet' | 'aux' | 'cetus' | 'pancake';

export type Venue = {
  name: VenueName;
  package: string;
  resource_type: string;
  source_coin: string;
  target_coin: string;
  curve_type: string;
  // f64
  source_amount: number;
  // f64
  target_amount: number;
  source_fee: number;
  target_fee: number;
  is_x_to_y: boolean;
  // function: `${string}::${string}::${string}`;
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

export type Hop = {
  source_coin: string;
  target_coin: string;
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
  source_coin: string;
  target_coin: string;
  source_amount: number;
  target_amount: number;
  swap_type: "direct" | "multi-hop" | "split";
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
  endpoint?: `https://${string}`,
  venueAllowList?: VenueName[],
};

export type SwapSettings = {
  slippageTolerance: number,
  transactionDeadline: number,
  maxGasFee: number,
};