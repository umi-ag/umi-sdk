import type { PaginatedCoins } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';
import { findCoinByType } from '@umi-ag/sui-coin-list';
import Decimal from 'decimal.js';
import { err, ok } from 'neverthrow';
import { match } from 'ts-pattern';
import { packageBook } from '../addressList/testnet';
import type { TradingRoute } from '../types';

export const make1hopSwapPayload = (
  route: TradingRoute,
  slippageTolerance: number,
  coins_s: PaginatedCoins['data'],
) => {
  const sourceCoinType = route[0].chain[0].source_coin;
  const targetCoinType = route[0].chain[0].target_coin;

  const sourceCoinInfo = findCoinByType(sourceCoinType);
  const targetCoinInfo = findCoinByType(targetCoinType);
  if (!sourceCoinInfo || !targetCoinInfo) {
    return err('coin not found');
  }

  const tradingUnit = route[0].chain[0].venues[0].venue;

  const first_venue = tradingUnit.venue_object_id;

  const sourceCoinAmount = new Decimal(tradingUnit.amount_in)
    .mul(10 ** sourceCoinInfo.decimals)
    .round()
    .toString();
  const minTargetCoinAmount = new Decimal(tradingUnit.min_amount_out)
    .mul(1 - slippageTolerance)
    .mul(10 ** targetCoinInfo.decimals)
    .round()
    .toString();

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
  route: TradingRoute,
  slippageTolerance: number,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const sourceCoinType = route[0].chain[0].source_coin;
  const targetCoinType = route[0].chain[1].target_coin;

  const sourceCoinInfo = findCoinByType(sourceCoinType);
  const targetCoinInfo = findCoinByType(targetCoinType);
  if (!sourceCoinInfo || !targetCoinInfo) {
    return err('coin not found');
  }

  const firstTradingUnit = route[0].chain[0].venues[0].venue;
  const secondTradingUnit = route[0].chain[1].venues[0].venue;

  const first_venue = firstTradingUnit.venue_object_id;
  const second_venue = secondTradingUnit.venue_object_id;

  const first_is_x_to_y = firstTradingUnit.is_x_to_y;
  const second_is_x_to_y = secondTradingUnit.is_x_to_y;
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const first_package = firstTradingUnit.protocol_name;
  const second_package = firstTradingUnit.protocol_name;

  const sourceCoinAmount = new Decimal(firstTradingUnit.amount_in)
    .mul(10 ** sourceCoinInfo.decimals)
    .toFixed(0);
  const minTargetCoinAmount = new Decimal(secondTradingUnit.min_amount_out)
    .mul(10 ** targetCoinInfo.decimals)
    .mul(1 - slippageTolerance)
    .toFixed(0);

  const coinUType = first_is_x_to_y
    ? firstTradingUnit.target_coin
    : firstTradingUnit.source_coin;

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::two_hop_${first_direction}${second_direction}_${first_package}_${second_package}_script`,
    typeArguments: [sourceCoinType, targetCoinInfo.type, coinUType],
    arguments: [
      txb.pure(first_venue),
      txb.pure(second_venue),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(sourceCoinAmount),
      txb.pure(minTargetCoinAmount),
    ],
  });
  return ok(txb);
};

export const make3hopSwapPayload = (
  route: TradingRoute,
  slippageTolerance: number,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const sourceCoinType = route[0].chain[0].source_coin;
  const targetCoinType = route[0].chain[1].target_coin;

  const sourceCoinInfo = findCoinByType(sourceCoinType);
  const targetCoinInfo = findCoinByType(targetCoinType);
  if (!sourceCoinInfo || !targetCoinInfo) {
    return err('coin not found');
  }

  const firstTradingUnit = route[0].chain[0].venues[0].venue;
  const secondTradingUnit = route[0].chain[1].venues[0].venue;
  const thirdTradingUnit = route[0].chain[2].venues[0].venue;

  const first_venue = firstTradingUnit.venue_object_id;
  const second_venue = secondTradingUnit.venue_object_id;
  const third_venue = thirdTradingUnit.venue_object_id;

  const first_is_x_to_y = firstTradingUnit.is_x_to_y;
  const second_is_x_to_y = secondTradingUnit.is_x_to_y;
  const third_is_x_to_y = thirdTradingUnit.is_x_to_y;
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const third_direction = third_is_x_to_y ? 'x' : 'y';
  const first_package = firstTradingUnit.protocol_name;
  const second_package = secondTradingUnit.protocol_name;
  const third_package = thirdTradingUnit.protocol_name;

  const sourceCoinAmount = new Decimal(firstTradingUnit.amount_in)
    .mul(10 ** sourceCoinInfo.decimals)
    .round()
    .toString();
  const minTargetCoinAmount = new Decimal(secondTradingUnit.min_amount_out)
    .mul(1 - slippageTolerance)
    .mul(10 ** targetCoinInfo.decimals)
    .round()
    .toString();

  const coinUType = first_is_x_to_y
    ? firstTradingUnit.target_coin
    : firstTradingUnit.source_coin;

  const coinVType = second_is_x_to_y
    ? secondTradingUnit.target_coin
    : secondTradingUnit.source_coin;

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::three_hop_${first_direction}${second_direction}${third_direction}_${first_package}_${second_package}_${third_package}_script`,
    typeArguments: [sourceCoinType, targetCoinType, coinUType, coinVType],
    arguments: [
      txb.pure(first_venue),
      txb.pure(second_venue),
      txb.pure(third_venue),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(sourceCoinAmount),
      txb.pure(minTargetCoinAmount),
    ],
  });

  return ok(txb);
};

export const make2splitSwapPayload = (
  route: TradingRoute,
  slippageTolerance: number,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const sourceCoinType = route[0].chain[0].source_coin;
  const targetCoinType = route[0].chain[0].target_coin;

  const sourceCoinInfo = findCoinByType(sourceCoinType);
  const targetCoinInfo = findCoinByType(targetCoinType);
  if (!sourceCoinInfo || !targetCoinInfo) {
    return err('coin not found');
  }

  const firstTradingUnit = route[0].chain[0].venues[0].venue;
  const secondTradingUnit = route[0].chain[0].venues[1].venue;
  // to bps
  const firstWeight = new Decimal(route[0].chain[0].venues[0].weight)
    .mul(10 ** 4).round().toString();
  const secondWeight = new Decimal(route[0].chain[0].venues[1].weight)
    .mul(10 ** 4).round().toString();

  const first_venue = firstTradingUnit.venue_object_id;
  const second_venue = secondTradingUnit.venue_object_id;

  const first_is_x_to_y = firstTradingUnit.is_x_to_y;
  const second_is_x_to_y = secondTradingUnit.is_x_to_y;
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const first_package = firstTradingUnit.protocol_name;
  const second_package = secondTradingUnit.protocol_name;

  const sourceCoinAmount = new Decimal(firstTradingUnit.amount_in)
    .mul(10 ** sourceCoinInfo.decimals)
    .round()
    .toString();
  const minTargetCoinAmount = new Decimal(secondTradingUnit.min_amount_out)
    .mul(1 - slippageTolerance)
    .mul(10 ** targetCoinInfo.decimals)
    .round()
    .toString();

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::two_split_${first_direction}${second_direction}_${first_package}_${second_package}_script`,
    typeArguments: [sourceCoinType, targetCoinType],
    arguments: [
      txb.pure(first_venue),
      txb.pure(second_venue),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(firstWeight),
      txb.pure(secondWeight),
      txb.pure(sourceCoinAmount),
      txb.pure(minTargetCoinAmount),
    ],
  });

  return ok(txb);
};

export const make3splitSwapPayload = (
  route: TradingRoute,
  slippageTolerance: number,
  coins_s: PaginatedCoins['data'],
) => {
  if (coins_s.length < 1) return err('The length input coins is less than 1');

  const sourceCoinType = route[0].chain[0].source_coin;
  const targetCoinType = route[0].chain[0].target_coin;

  const sourceCoinInfo = findCoinByType(sourceCoinType);
  const targetCoinInfo = findCoinByType(targetCoinType);
  if (!sourceCoinInfo || !targetCoinInfo) {
    return err('coin not found');
  }

  const firstTradingUnit = route[0].chain[0].venues[0].venue;
  const secondTradingUnit = route[0].chain[0].venues[1].venue;
  const thirdTradingUnit = route[0].chain[0].venues[2].venue;
  // to bps
  const firstWeight = new Decimal(route[0].chain[0].venues[0].weight)
    .mul(10 ** 3).round().toString();
  const secondWeight = new Decimal(route[0].chain[0].venues[1].weight)
    .mul(10 ** 3).round().toString();
  const thirdWeight = new Decimal(route[0].chain[0].venues[2].weight)
    .mul(10 ** 3).round().toString();

  const first_venue = firstTradingUnit.venue_object_id;
  const second_venue = secondTradingUnit.venue_object_id;
  const third_venue = thirdTradingUnit.venue_object_id;

  const first_is_x_to_y = firstTradingUnit.is_x_to_y;
  const second_is_x_to_y = secondTradingUnit.is_x_to_y;
  const third_is_x_to_y = thirdTradingUnit.is_x_to_y;
  const first_direction = first_is_x_to_y ? 'x' : 'y';
  const second_direction = second_is_x_to_y ? 'x' : 'y';
  const third_direction = third_is_x_to_y ? 'x' : 'y';
  const first_package = firstTradingUnit.protocol_name;
  const second_package = secondTradingUnit.protocol_name;
  const third_package = thirdTradingUnit.protocol_name;

  const sourceCoinAmount = new Decimal(firstTradingUnit.amount_in)
    .mul(10 ** sourceCoinInfo.decimals)
    .round()
    .toString();
  const minTargetCoinAmount = new Decimal(secondTradingUnit.min_amount_out)
    .mul(1 - slippageTolerance)
    .mul(10 ** targetCoinInfo.decimals)
    .round()
    .toString();

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageBook.sui_aggregator.packageObjectId}::${packageBook.sui_aggregator.modules.scripts}::three_split_${first_direction}${second_direction}${third_direction}_${first_package}_${second_package}_${third_package}_script`,
    typeArguments: [sourceCoinType, targetCoinType],
    arguments: [
      txb.pure(first_venue),
      txb.pure(second_venue),
      txb.pure(third_venue),
      txb.makeMoveVec({ objects: coins_s.map(coin => txb.object(coin.coinObjectId)) }),
      txb.pure(firstWeight),
      txb.pure(secondWeight),
      txb.pure(thirdWeight),
      txb.pure(sourceCoinAmount),
      txb.pure(minTargetCoinAmount),
    ],
  });

  return ok(txb);
};

export const makeSuiSwapPayload = (
  route: TradingRoute,
  slippageTolerance: number,
  coins_s: PaginatedCoins['data'],
) => {
  const nSplits = route[0].chain[0].venues.length;
  const nHops = route[0].chain.length;

  return match({ nSplits, nHops })
    .with({ nSplits: 1, nHops: 1 }, () => make1hopSwapPayload(route, slippageTolerance, coins_s))
    .with({ nSplits: 1, nHops: 2 }, () => make2hopSwapPayload(route, slippageTolerance, coins_s))
    .with({ nSplits: 1, nHops: 3 }, () => make3hopSwapPayload(route, slippageTolerance, coins_s))
    .with({ nSplits: 2, nHops: 1 }, () => make2splitSwapPayload(route, slippageTolerance, coins_s))
    .with({ nSplits: 3, nHops: 1 }, () => make3splitSwapPayload(route, slippageTolerance, coins_s));
};
