export type TradingUnit = {
  source_coin: string;
  target_coin: string;
  amount_in: number;
  min_amount_out: number;
  fee_source: number;
  fee_target: number;
  venue_object_id: string;
  is_x_to_y: boolean;
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

// export type CoinAmount = {
//   coin_type: string,
//   amount: number,
// };

// export type DEX = {
//   name: String,
//   reserve_x: CoinAmount,
//   reserve_y: CoinAmount,
//   fee_x: number,
//   fee_y: number,
// };

// export type SwapQuote = {
//   steps: {
//     dex: DEX,
//     receive_coin: {
//  amount: number,
//     }
//   }[],
//   g_score: number,
//   h_score: number,
// };

// export type SwapInfo = {
//   fromCoin: CoinAmount;
//   toCoin: CoinAmount;
//   part: Decimal;
//   fee: CoinAmount;
//   pool: PoolStatus;
// };

// export type PriceQuote = {
//   fromCoin: CoinAmount;
//   toCoin: CoinAmount;
//   swapType: 'direct' | 'multi-hop' | 'split';
//   swapRoute1: SwapInfo;
//   swapRoute2?: SwapInfo; // exists when `swapType` is either multi-hop or split
//   swapRoute3?: SwapInfo; // exists when `swapType` is either multi-hop or split
//   price: Decimal;
// };
