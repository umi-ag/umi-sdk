export type TradingUnit = {
  source_coin: string;
  target_coin: string;
  // f64
  source_amount: number;
  // f64
  target_amount: number;
  fee_source: number;
  fee_target: number;

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
  chain: TradingChain;
  weight: number;
}[];

export type VenueInfo = {
  venueObjectId: string,
  coinXType: string,
  coinYType: string,
};

export type VenueBook = Record<string, Record<string, VenueInfo>>;

export type QuoteQuery = {
  sourceCoin: string,
  targetCoin: string,
  inputAmount: string,
  maxHops?: number,
  maxRoutes?: number,
};
