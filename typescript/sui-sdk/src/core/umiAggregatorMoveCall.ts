import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { match } from 'ts-pattern';
import type { TradingRoute, Venue } from '../types';
import { checkAmountSufficient, mergeCoinsMoveCall } from '../utils';

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
  coins: TransactionArgument[];
  accountAddress: TransactionArgument,
  minTargetAmount: TransactionArgument;
};

export const umiAggregatorMoveCall = ({
  transactionBlock: txb,
  quote,
  coins,
  accountAddress,
  minTargetAmount,
}: UmiAggregatorMoveCallArgs) => {
  const sourceCoin = mergeCoinsMoveCall({
    txb,
    coinType: quote.source_coin,
    coins,
  });

  const targetCoins: TransactionArgument[] = [];

  // Process each chain in the trading route
  for (const { hop } of quote.hops) {
    // Process each step in the chain
    let coinToSwap: TransactionArgument = sourceCoin;
    for (const { venues } of hop.steps) {
      const coins: TransactionArgument[] = [];

      // Process each step in the trading venue
      for (const { venue } of venues) {
        const swapped = tradeMoveCall(txb, venue, coinToSwap);
        coins.push(swapped);
      }

      if (coins.length < 1) {
        // return err('Invalid trade hop');
        throw new Error('Invalid trade hop');
      }
      const [coin, ...rest] = coins;
      if (rest.length > 0) {
        txb.mergeCoins(coin, rest);
      }
      coinToSwap = coin;
    }

    targetCoins.push(coinToSwap);
    // send the remaining coin to the account address
    // txb.transferObjects([splitCoin], accountAddress);
  }

  if (targetCoins.length < 1) {
    // return err('Invalid trade route');
    throw new Error('Invalid trade route');
  }
  const [targetCoin, ...restTargetCoins] = targetCoins;
  if (restTargetCoins.length > 0) {
    txb.mergeCoins(targetCoin, restTargetCoins);
  }

  checkAmountSufficient({
    txb,
    coinType: quote.target_coin,
    coin: targetCoin,
    amount: minTargetAmount,
  });

  // return ok(targetCoin);
  return targetCoin;
};
