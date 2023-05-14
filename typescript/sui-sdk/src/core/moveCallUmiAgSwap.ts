import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import zip from 'just-zip-it';
import { match } from 'ts-pattern';
import { UMIAG_PACKAGE_ID } from '../config';
import type { TradingRoute, Venue } from '../types';
import type { MoveCallCheckAmountSufficientArgs, MoveCallMaybeSplitCoinsAndTransferRest } from '../utils';
import { moveCallMergeCoins, moveCallSplitCoinByWeights } from '../utils';
import { toBps } from '../utils/number';
import { moveCallAnimeswap } from '../venues/animeswap';
import { moveCallBluemove } from '../venues/bluemove';
import { moveCallCetus } from '../venues/cetus';
import { moveCallInterestswap } from '../venues/interestswap';
import { moveCallKriyaswap } from '../venues/kriyaswap';
import { moveCallSuiswap } from '../venues/suiswap';

export const getCoinXYTypes = (venue: Venue) => {
  const [coinTypeX, coinTypeY] = venue.is_x_to_y
    ? [venue.source_coin, venue.target_coin]
    : [venue.target_coin, venue.source_coin];
  return [coinTypeX, coinTypeY];
};

export const maybeFindOrCreateObject = (
  txb: TransactionBlock,
  objectId: string,
) => {
  // If the object is already in the transaction block, use it.
  const venueObjectArg = txb.blockData.inputs.find(i => i.value === objectId)
    ?? txb.pure(objectId);

  return venueObjectArg;
};

export const moveCallSwapUmaUdo = (
  txb: TransactionBlock,
  venue: Venue,
  coin: TransactionArgument,
) => {
  const [coinTypeX, coinTypeY] = getCoinXYTypes(venue);

  const venueObjectArg = maybeFindOrCreateObject(txb, venue.object_id);

  return txb.moveCall({
    target: venue.function,
    typeArguments: [coinTypeX, coinTypeY],
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
    .with({ name: 'animeswap' }, () => moveCallAnimeswap(txb, venue, coin))
    .with({ name: 'bluemoveswap' }, () => moveCallBluemove(txb, venue, coin))
    .with({ name: 'cetus' }, () => moveCallCetus(txb, venue, coin))
    .with({ name: 'kriyaswap' }, () => moveCallKriyaswap(txb, venue, coin))
    .with({ name: 'suiswap' }, () => moveCallSuiswap(txb, venue, coin))
    .with({ name: 'interestswap' }, () => moveCallInterestswap(txb, venue, coin))
    .otherwise(() => moveCallSwapUmaUdo(txb, venue, coin));
};

export type MoveCallUmiAgSwapArgs = {
  transactionBlock: TransactionBlock,
  quote: TradingRoute,
  coins: TransactionArgument[];
  accountAddress: TransactionArgument,
  minTargetAmount: TransactionArgument;
};

export const moveCallUmiAgSwapDirect = ({
  transactionBlock: txb,
  quote,
  coins,
  accountAddress,
  minTargetAmount,
}: MoveCallUmiAgSwapArgs) => {
  const sourceCoin = moveCallMergeCoins({
    txb,
    coinType: quote.source_coin,
    coins,
  });

  const targetCoins: TransactionArgument[] = [];

  const pathWeights = quote.paths.map(p => toBps(p.weight));
  const coinsForPaths = moveCallSplitCoinByWeights({
    txb,
    coinType: quote.source_coin,
    coins: [sourceCoin],
    weights: pathWeights,
  });

  // Process each chain in the trading route
  for (const [{ path }, coinForPath] of zip(quote.paths, coinsForPaths)) {
    // Process each step in the chain
    let coinToSwap: TransactionArgument = coinForPath;
    for (const { venues } of path.steps) {
      const swappedCoins: TransactionArgument[] = [];

      const venueWeights = venues.map(v => toBps(v.weight));
      const coinsForVenues = moveCallSplitCoinByWeights({
        txb,
        coinType: path.source_coin,
        coins: [coinToSwap],
        weights: venueWeights,
      });

      // Process each step in the trading venue
      for (const [{ venue }, coinForVenue] of zip(venues, coinsForVenues)) {
        const swapped = moveCallTrade(txb, venue, coinForVenue);
        swappedCoins.push(swapped);
      }

      if (swappedCoins.length < 1) {
        // return err('Invalid trade path');
        throw new Error('Invalid trade path');
      }

      coinToSwap = moveCallMergeCoins({
        txb,
        coinType: path.target_coin,
        coins: swappedCoins,
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

  moveCallUmiAgSwapEnd({
    txb,
    coinType: quote.target_coin,
    coin: targetCoin,
    amount: minTargetAmount,
  });

  // return ok(targetCoin);
  return targetCoin;
};

export const moveCallUmiAgSwapExact = ({
  transactionBlock: txb,
  quote,
  coins,
  accountAddress,
  minTargetAmount,
}: MoveCallUmiAgSwapArgs) => {
  const coin = moveCallUmiAgSwapBegin({
    txb,
    coinType: quote.source_coin,
    coins,
    amount: txb.pure(quote.source_amount),
    recipient: accountAddress,
  });

  return moveCallUmiAgSwapDirect({
    transactionBlock: txb,
    quote,
    coins: [coin],
    accountAddress,
    minTargetAmount,
  });
};

export const moveCallUmiAgSwapBegin = ({
  txb,
  coinType,
  coins,
  amount,
  recipient,
}: MoveCallMaybeSplitCoinsAndTransferRest) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::umi_aggregator::swap_begin`,
    typeArguments: [coinType],
    arguments: [txb.makeMoveVec({ objects: coins }), amount, recipient],
  });
};

export const moveCallUmiAgSwapEnd = ({
  txb,
  coinType,
  coin,
  amount,
}: MoveCallCheckAmountSufficientArgs) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::umi_aggregator::swap_end`,
    typeArguments: [coinType],
    arguments: [coin, amount],
  });
};
