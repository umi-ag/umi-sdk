import type { PaginatedCoins } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';
import { err, ok } from 'neverthrow';
import type { PriceQuote, SwapSettings } from 'umi-sdk';
import { CoinAmount, is_x_to_y_ } from 'umi-sdk';
import { packageBook } from '../addressList/testnet';
import type { TradingRoute } from '../types';

export const make1hopSwapPayload = (
  route: TradingRoute,
  slippageTolerance: number,
  coins_s: PaginatedCoins['data'],
) => {
  const sourceCoinType = route[0].chain[0].source_coin;
  const targetCoinType = route[0].chain[0].target_coin;

  const tradingUnit = route[0].chain[0].venues[0].venue;

  const first_venue = tradingUnit.venue_object_id;

  const sourceCoinAmount = tradingUnit.amount_in;
  const minTargetCoinAmount = tradingUnit.min_amount_out;

  const first_direction = tradingUnit.is_x_to_y ? 'x' : 'y';
  const first_package = tradingUnit.protocol_name;

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::one_hop_${first_direction}_${first_package}_script`,
    typeArguments: [sourceCoinType, targetCoinType],
    arguments: [
      txb.pure(first_venue),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(sourceCoinAmount),
      txb.pure(minTargetCoinAmount),
    ],
  });

  return ok(txb);
};

export const make2hopSwapPayload = (
  quote: PriceQuote,
  swapSettings: SwapSettings,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const CoinS = quote.fromCoin.coinInfo;
  const CoinT = quote.toCoin.coinInfo;
  const first_pool = quote.swapRoute1.pool.objectId;
  const second_pool = quote.swapRoute2.pool.objectId;

  const first_is_x_to_y = is_x_to_y_(quote.swapRoute1);
  const second_is_x_to_y = is_x_to_y_(quote.swapRoute2);
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const first_package = quote.swapRoute1.pool.protocolName;
  const second_package = quote.swapRoute2.pool.protocolName;

  const sourceCoinAmount = quote.fromCoin;
  const minTargetCoinAmount = new CoinAmount(
    quote.toCoin.coinInfo,
    quote.toCoin.amount.mul(swapSettings.slippageTolerance)
  );

  const CoinU = first_is_x_to_y
    ? quote.swapRoute1.pool.pair.coinY.coinInfo
    : quote.swapRoute1.pool.pair.coinX.coinInfo;

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::two_hop_${first_direction}${second_direction}_${first_package}_${second_package}_script`,
    typeArguments: [CoinS.type, CoinT.type, CoinU.type],
    arguments: [
      txb.pure(first_pool),
      txb.pure(second_pool),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(sourceCoinAmount.toU64),
      txb.pure(minTargetCoinAmount.toU64),
    ],
  });
  return ok(txb);
};

export const make3hopSwapPayload = (
  quote: PriceQuote,
  swapSettings: SwapSettings,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const CoinS = quote.fromCoin.coinInfo;
  const CoinT = quote.toCoin.coinInfo;
  const first_pool = quote.swapRoute1.pool.objectId;
  const second_pool = quote.swapRoute2.pool.objectId;
  const third_pool = quote.swapRoute3.pool.objectId;

  const first_is_x_to_y = is_x_to_y_(quote.swapRoute1);
  const second_is_x_to_y = is_x_to_y_(quote.swapRoute2);
  const third_is_x_to_y = is_x_to_y_(quote.swapRoute3);
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const third_direction = third_is_x_to_y ? 'x' : 'y';
  const first_package = quote.swapRoute1.pool.protocolName;
  const second_package = quote.swapRoute2.pool.protocolName;
  const third_package = quote.swapRoute3.pool.protocolName;

  const sourceCoinAmount = quote.fromCoin;
  const minTargetCoinAmount = new CoinAmount(
    quote.toCoin.coinInfo,
    quote.toCoin.amount.mul(swapSettings.slippageTolerance)
  );

  const CoinU = first_is_x_to_y
    ? quote.swapRoute1.pool.pair.coinY.coinInfo
    : quote.swapRoute1.pool.pair.coinX.coinInfo;

  const CoinV = second_is_x_to_y
    ? quote.swapRoute2.pool.pair.coinY.coinInfo
    : quote.swapRoute2.pool.pair.coinX.coinInfo;

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::three_hop_${first_direction}${second_direction}${third_direction}_${first_package}_${second_package}_${third_package}_script`,
    typeArguments: [CoinS.type, CoinT.type, CoinU.type, CoinV.type],
    arguments: [
      txb.pure(first_pool),
      txb.pure(second_pool),
      txb.pure(third_pool),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(sourceCoinAmount.toU64),
      txb.pure(minTargetCoinAmount.toU64),
    ],
  });

  return ok(txb);
};

export const make2splitSwapPayload = (
  quote: PriceQuote,
  swapSettings: SwapSettings,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const CoinS = quote.fromCoin.coinInfo;
  const CoinT = quote.toCoin.coinInfo;
  const first_pool = quote.swapRoute1.pool.objectId;
  const second_pool = quote.swapRoute2.pool.objectId;

  const first_is_x_to_y = is_x_to_y_(quote.swapRoute1);
  const second_is_x_to_y = is_x_to_y_(quote.swapRoute2);
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const first_package = quote.swapRoute1.pool.protocolName;
  const second_package = quote.swapRoute2.pool.protocolName;

  const sourceCoinAmount = quote.fromCoin;
  const minTargetCoinAmount = new CoinAmount(
    quote.toCoin.coinInfo,
    quote.toCoin.amount.mul(swapSettings.slippageTolerance)
  );

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::two_split_${first_direction}${second_direction}_${first_package}_${second_package}_script`,
    typeArguments: [CoinS.type, CoinT.type],
    arguments: [
      txb.pure(first_pool),
      txb.pure(second_pool),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(sourceCoinAmount.toU64),
      txb.pure(minTargetCoinAmount.toU64),
    ],
  });

  return ok(txb);
};

export const make3splitSwapPayload = (
  quote: PriceQuote,
  swapSettings: SwapSettings,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const CoinS = quote.fromCoin.coinInfo;
  const CoinT = quote.toCoin.coinInfo;
  const first_pool = quote.swapRoute1.pool.objectId;
  const second_pool = quote.swapRoute2.pool.objectId;
  const third_pool = quote.swapRoute3.pool.objectId;

  const first_is_x_to_y = is_x_to_y_(quote.swapRoute1);
  const second_is_x_to_y = is_x_to_y_(quote.swapRoute2);
  const third_is_x_to_y = is_x_to_y_(quote.swapRoute3);
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const third_direction = third_is_x_to_y ? 'x' : 'y';
  const first_package = quote.swapRoute1.pool.protocolName;
  const second_package = quote.swapRoute2.pool.protocolName;
  const third_package = quote.swapRoute3.pool.protocolName;

  const sourceCoinAmount = quote.fromCoin;
  const minTargetCoinAmount = new CoinAmount(
    quote.toCoin.coinInfo,
    quote.toCoin.amount.mul(swapSettings.slippageTolerance)
  );

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::three_split_${first_direction}${second_direction}${third_direction}_${first_package}_${second_package}_${third_package}_script`,
    typeArguments: [CoinS.type, CoinT.type],
    arguments: [
      txb.pure(first_pool),
      txb.pure(second_pool),
      txb.pure(third_pool),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(quote.swapRoute1.part.mul(10 ** 3).round().toString()),
      txb.pure(quote.swapRoute2.part.mul(10 ** 3).round().toString()),
      txb.pure(sourceCoinAmount.toU64),
      txb.pure(minTargetCoinAmount.toU64),
    ],
  });

  return ok(txb);
};

export const makeSuiSwapPayload = (
  quote: PriceQuote,
  swapSettings: SwapSettings,
  coins_s: PaginatedCoins['data'],
) => {
  if (quote.swapType === 'split') {
    if (quote.swapRoute3) {
      return make3splitSwapPayload(quote, swapSettings, coins_s);
    } else {
      return make2splitSwapPayload(quote, swapSettings, coins_s);
    }
  } else {
    if (quote.swapRoute3) {
      return make3hopSwapPayload(quote, swapSettings, coins_s);
    } else if (quote.swapRoute2) {
      return make2hopSwapPayload(quote, swapSettings, coins_s);
    } else {
      return make1hopSwapPayload(quote, swapSettings, coins_s);
    }
  }
};
