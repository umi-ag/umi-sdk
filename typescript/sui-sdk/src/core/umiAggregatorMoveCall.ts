import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { findCoinByType } from '@umi-ag/sui-coin-list';
import Decimal from 'decimal.js';
import { match } from 'ts-pattern';
import type { TradingRoute, Venue } from '../types';

export const getCoinXYTypes = (venue: Venue) => {
  const [coinXType, coinYType] = venue.is_x_to_y
    ? [venue.source_coin, venue.target_coin]
    : [venue.target_coin, venue.source_coin];
  return [coinXType, coinYType];
};

export const maybeFindOrCreateVenueObject = (
  txb: TransactionBlock,
  venue: Venue,
) => {
  // If the venue object is already in the transaction block, use it.
  const venueObjectArg = txb.blockData.inputs.find(i => i.value === venue.object_id)
    ?? txb.pure(venue.object_id);

  return venueObjectArg;
};

export const swapUmaUdoMoveCall = (
  txb: TransactionBlock,
  venue: Venue,
  coin: TransactionArgument,
) => {
  const [coinXType, coinYType] = getCoinXYTypes(venue);

  const venueObjectArg = maybeFindOrCreateVenueObject(txb, venue);

  return txb.moveCall({
    target: venue.function,
    typeArguments: [coinXType, coinYType],
    arguments: [
      venueObjectArg,
      coin,
    ]
  });
};

export const tradeMoveCall = (
  txb: TransactionBlock,
  venue: Venue,
  coin: TransactionArgument,
) => {
  return match(venue)
    .otherwise(() => swapUmaUdoMoveCall(txb, venue, coin));
};

export type UmiAggregatorMoveCallArgs = {
  transactionBlock: TransactionBlock,
  quote: TradingRoute,
  minTargetCoinAmount?: TransactionArgument;
  coins: TransactionArgument[];
  accountAddress: TransactionArgument,
};

export const umiAggregatorMoveCall = ({
  transactionBlock: txb,
  quote,
  coins,
  minTargetCoinAmount,
  accountAddress,
}: UmiAggregatorMoveCallArgs) => {
  const sourceCoinInfo = findCoinByType(quote.source_coin);
  if (!sourceCoinInfo) {
    // return err('Source coin not found.');
    throw new Error('Source coin not found.');
  }

  const [sourceCoin, ...restSourceCoins] = coins;
  if (restSourceCoins.length > 0) {
    txb.mergeCoins(
      sourceCoin,
      restSourceCoins,
    );
  }

  const targetCoins: TransactionArgument[] = [];

  // Process each chain in the trading route
  for (const { chain, weight } of quote.chains) {
    const splitAmountForChain = new Decimal(quote.source_amount)
      .mul(weight)
      .mul(10 ** sourceCoinInfo.decimals)
      .round()
      .toNumber();
    console.log('splitAmountForChain', splitAmountForChain);

    // TODO: need to be kizen
    const [splitCoin] = txb.splitCoins(
      sourceCoin,
      [txb.pure(splitAmountForChain)],
    );

    // Process each step in the chain
    let coinToSwap = splitCoin;
    for (const { venues } of chain.steps) {
      const coins: TransactionArgument[] = [];

      // Process each step in the trading venue
      for (const { venue, weight } of venues) {
        const splitAmountForTrade = new Decimal(splitAmountForChain)
          .mul(weight)
          .round()
          .toNumber();

        // TODO: need to be kizen
        const [coin] = txb.splitCoins(
          coinToSwap,
          [txb.pure(splitAmountForTrade)],
        );

        const swapped = tradeMoveCall(txb, venue, coin);
        coins.push(swapped);
      }

      if (coins.length < 1) {
        // return err('Invalid trade chain');
        throw new Error('Invalid trade chain');
      }
      const [coin, ...rest] = coins;
      if (rest.length > 0) {
        txb.mergeCoins(coin, rest);
      }
      coinToSwap = coin;
    }

    targetCoins.push(coinToSwap);
    // send the remaining coin to the account address
    txb.transferObjects([splitCoin], accountAddress);
  }

  if (targetCoins.length < 1) {
    // return err('Invalid trade route');
    throw new Error('Invalid trade route');
  }
  const [targetCoin, ...restTargetCoins] = targetCoins;
  if (restTargetCoins.length > 0) {
    txb.mergeCoins(targetCoin, restTargetCoins);
  }

  // return ok(targetCoin);
  return targetCoin;
};
