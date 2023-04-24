export type TradingUnit = {
  source_coin: string;
  target_coin: string;
  amount_in: number;
  min_amount_out: number;
  fee_source: number;
  fee_target: number;
  venue_object_id: string;
  is_x_to_y: boolean;
  protocol_name: string;
};

export type TradingBlock = {
  source_coin: string;
  target_coin: string;
  venues: {
    venue: TradingUnit;
    weight: number;
  }[];
};

export type TradingChain = TradingBlock[];

export type TradingRoute = {
  chain: TradingChain;
  weight: number;
}[];

export type Venue = {
  venueObjectId: string,
  coinXType: string,
  coinYType: string,
};

export type QuoteQuery = {
  sourceCoin: string,
  targetCoin: string,
  inputAmount: string,
  maxHops?: number,
  maxRoutes?: number,
};
