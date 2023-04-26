export type TradingUnit = {
  source_coin: string;
  target_coin: string;
  // f64
  source_amount: number;
  // f64
  target_amount: number;
  fee_source: number;
  fee_target: number;

  name: string;
  object_type: string;
  object_id: string;
  is_x_to_y: boolean;
  function: `${string}::${string}::${string}`;

  /** @deprecated */
  protocol_name: string;
};

export type TradingBlock = {
  source_coin: string;
  target_coin: string;
  venues: {
    venue: TradingUnit;
    // f64
    weight: number;
  }[];
};

export type TradingChain = TradingBlock[];

export type TradingRoute = {
  source_coin: string;
  target_coin: string;
  chains: {
    chain: TradingChain;
    weight: number;
  }[];
};

export type VenueInfo = {
  venueObjectId: string,
  coinXType: string,
  coinYType: string,
};

export type VenueBook = Record<string, Record<string, VenueInfo>>;

export type QuoteQuery = {
  sourceCoin: string,
  targetCoin: string,
  inputAmount: string | number,
  maxHops?: number,
  maxRoutes?: number,
};
