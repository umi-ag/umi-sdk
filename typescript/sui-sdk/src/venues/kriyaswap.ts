import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCoinValue } from '../utils';

export const moveCallKriyaswap = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.target_coin;

  const moveArgs = [
    maybeFindOrCreateObject(txb, venue.object_id), // pool
    sourceCoin,
    moveCallCoinValue({ txb, coinType: coinTypeSource, coin: sourceCoin }),
    txb.pure(0),
  ];

  // public swap_token_x<Ty0, Ty1>(
  //   Arg0: &mut Pool<Ty0, Ty1>,
  //   Arg1: Coin<Ty0>,
  //   Arg2: u64,
  //   Arg3: u64,
  //   Arg4: &mut TxContext
  // ): Coin<Ty1> {
  if (venue.is_x_to_y) {
    return txb.moveCall({
      target: '0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66::spot_dex::swap_token_x',
      typeArguments: [coinTypeSource, coinTypeTarget],
      arguments: moveArgs,
    });
  } else {
    return txb.moveCall({
      target: '0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66::spot_dex::swap_token_y',
      typeArguments: [coinTypeTarget, coinTypeSource],
      arguments: moveArgs,
    });
  }
};
