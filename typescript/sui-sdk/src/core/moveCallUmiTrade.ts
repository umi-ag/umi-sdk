import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { match } from 'ts-pattern';
import type { TradingRoute, Venue } from '../types';
import { moveCallCheckAmountSufficient, moveCallMaybeSplitCoinsAndTransferRest, moveCallMergeCoins } from '../utils';

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

export const moveCallSwapUmaUdo = (
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

export const moveCallTrade = (
  txb: TransactionBlock,
  venue: Venue,
  coin: TransactionArgument,
) => {
  return match(venue)
    .otherwise(() => moveCallSwapUmaUdo(txb, venue, coin));
};

export type MoveCallUmiTradeArgs = {
  transactionBlock: TransactionBlock,
  quote: TradingRoute,
  coins: TransactionArgument[];
  accountAddress: TransactionArgument,
  minTargetAmount: TransactionArgument;
};

export const moveCallUmiTradeDirect = ({
  transactionBlock: txb,
  quote,
  coins,
  accountAddress,
  minTargetAmount,
}: MoveCallUmiTradeArgs) => {
  const sourceCoin = moveCallMergeCoins({
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
        const swapped = moveCallTrade(txb, venue, coinToSwap);
        coins.push(swapped);
      }

      if (coins.length < 1) {
        // return err('Invalid trade hop');
        throw new Error('Invalid trade hop');
      }

      coinToSwap = moveCallMergeCoins({
        txb,
        coinType: hop.target_coin,
        coins,
      });
    }

    targetCoins.push(coinToSwap);
    // send the remaining coin to the account address
    // txb.transferObjects([splitCoin], accountAddress);
  }

  if (targetCoins.length < 1) {
    // return err('Invalid trade route');
    throw new Error('Invalid trade route');
  }

  const targetCoin = moveCallMergeCoins({
    txb,
    coinType: quote.target_coin,
    coins: targetCoins,
  });

  moveCallCheckAmountSufficient({
    txb,
    coinType: quote.target_coin,
    coin: targetCoin,
    amount: minTargetAmount,
  });

  // return ok(targetCoin);
  return targetCoin;
};

export const moveCallUmiTradeExactSourceCoin = ({
  transactionBlock: txb,
  quote,
  coins,
  accountAddress,
  minTargetAmount,
}: MoveCallUmiTradeArgs) => {
  const coin = moveCallMaybeSplitCoinsAndTransferRest({
    txb,
    coinType: quote.source_coin,
    coins,
    amount: txb.pure(quote.source_amount),
    recipient: accountAddress,
  });

  return moveCallUmiTradeDirect({
    transactionBlock: txb,
    quote,
    coins: [coin],
    accountAddress,
    minTargetAmount,
  });
};
