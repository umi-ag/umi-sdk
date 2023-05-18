import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';

export const moveCallInterestswap = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.target_coin;

  const DEX_STORAGE_ID = '0xdf2ee39f28fdf4bc5d5b5dc89926ac121839f8594fa51b2383a14cb99ab25a77';

  const moveArgs = [
    maybeFindOrCreateObject(txb, DEX_STORAGE_ID), // DEX Storage
    maybeFindOrCreateObject(txb, '0x6'),
    sourceCoin,
    txb.pure(0),
  ];

  // public fun swap_token_x<X, Y>(
  //   storage: &mut DEXStorage,
  //   clock_object: &Clock,
  //   coin_x: Coin<X>,
  //   coin_y_min_value: u64,
  //   ctx: &mut TxContext
  // ): Coin<Y> {}

  if (venue.is_x_to_y) {
    return txb.moveCall({
      target: '0x5c45d10c26c5fb53bfaff819666da6bc7053d2190dfa29fec311cc666ff1f4b0::router::swap_token_x',
      typeArguments: [coinTypeSource, coinTypeTarget],
      arguments: moveArgs,
    });
  } else {
    return txb.moveCall({
      target: '0x5c45d10c26c5fb53bfaff819666da6bc7053d2190dfa29fec311cc666ff1f4b0::router::swap_token_y',
      typeArguments: [coinTypeTarget, coinTypeSource],
      arguments: moveArgs,
    });
  }
};
