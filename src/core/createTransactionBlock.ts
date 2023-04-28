import type { TransactionArgument } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';
import { findCoinByType } from '@umi-ag/sui-coin-list';
import Decimal from 'decimal.js';
import { err, ok } from 'neverthrow';
import type { CoinObject, SwapConfig, TradingRoute, Venue } from '../types';

export const addIntoBalanceCall = (
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
) => {
  return txb.moveCall({
    target: '0x2::coin::into_balance',
    typeArguments: [coinType],
    arguments: [coin],
  });
};

const addUmaUdoMoveCall = (
  txb: TransactionBlock,
  venue: Venue,
  coin: TransactionArgument,
) => {
  const [coinXType, coinYType] = venue.is_x_to_y
    ? [venue.source_coin, venue.target_coin]
    : [venue.target_coin, venue.source_coin];

  return txb.moveCall({
    target: venue.function,
    typeArguments: [coinXType, coinYType],
    arguments: [
      txb.pure(venue.object_id),
      coin,
    ]
  });
};

export const createTradeTransactionBlockFromRoute = (
  owner: string,
  route: TradingRoute,
  coins_s: CoinObject[],
  swapConfig: SwapConfig,
) => {
  const txb = new TransactionBlock();

  const sourceCoin = findCoinByType(route.source_coin);
  if (!sourceCoin) {
    return err('source coin not found');
  }

  const [mergedCoin, ...remainingCoins] = coins_s;
  if (remainingCoins.length > 0) {
    txb.mergeCoins(
      txb.object(mergedCoin.coinObjectId),
      remainingCoins.map(c => txb.object(c.coinObjectId)),
    );
  }

  const swappedCoins: TransactionArgument[] = [];

  // Process each chain in the trading route
  for (const { chain, weight } of route.chains) {
    const splitAmountForChain = new Decimal(route.source_amount)
      .mul(weight)
      .mul(10 ** sourceCoin.decimals)
      .round()
      .toNumber();

    // need to be kizen
    const [splitCoin] = txb.splitCoins(
      txb.object(mergedCoin.coinObjectId),
      [txb.pure(splitAmountForChain)],
    );

    // Process each step in the chain
    let coinToSwap = splitCoin;
    for (const { venues } of chain.steps) {
      const coins: any[] = [];

      // Process each step in the trading venue
      for (const { venue, weight } of venues) {
        const splitAmountForTrade = new Decimal(splitAmountForChain)
          .mul(weight)
          .round()
          .toNumber();

        const [coin] = txb.splitCoins(
          coinToSwap,
          [txb.pure(splitAmountForTrade)],
        );

        const swapped = addUmaUdoMoveCall(txb, venue, coin);
        coins.push(swapped);
      }

      if (coins.length < 1) {
        return err('Invalid trade chain');
      }
      const [coin, ...rest] = coins;
      txb.mergeCoins(coin, rest);
      coinToSwap = coin;
    }
    swappedCoins.push(coinToSwap);
    txb.transferObjects([splitCoin], txb.pure(owner));
  }

  if (swappedCoins.length < 1) {
    return err('Invalid trade route');
  }
  const [finalCoin, ...restCoins] = swappedCoins;
  if (restCoins.length > 0) {
    txb.mergeCoins(finalCoin, restCoins);
  }

  txb.transferObjects([finalCoin], txb.pure(owner));

  return ok(txb);
};