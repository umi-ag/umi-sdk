import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCoinValue } from '../utils';

export const moveCallBayswap = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin_type;
  const coinTypeTarget = venue.target_coin_type;

  const DEX_STORAGE_ID = '0x53568bcc281b720f257e53397b45228186cc3f47e714ab2ab5afea87af7ed903';

  const CURVE_TYPE = '0x227f865230dd4fc947321619f56fee37dc7ac582eb22e3eab29816f717512d9d::curves::Uncorrelated';

  const sourceAmount = moveCallCoinValue({ txb, coinType: coinTypeSource, coin: sourceCoin });

  const moveArgs = [
    maybeFindOrCreateObject(txb, DEX_STORAGE_ID), // DEX Storage
    sourceCoin,
    sourceAmount,
  ];

  // public swap_exact_coin_x_for_coin_y<Ty0, Ty1, Ty2>(
  //   Arg0: &mut GlobalStorage,
  //   Arg1: Coin<Ty0>,
  //   Arg2: u64,
  //   Arg3: &mut TxContext
  // ): Coin<Ty1> {}

  if (venue.is_x_to_y) {
    return txb.moveCall({
      target: '0x227f865230dd4fc947321619f56fee37dc7ac582eb22e3eab29816f717512d9d::router::swap_exact_coin_x_for_coin_y',
      typeArguments: [coinTypeSource, coinTypeTarget, CURVE_TYPE],
      arguments: moveArgs,
    });
  } else {
    return txb.moveCall({
      target: '0x227f865230dd4fc947321619f56fee37dc7ac582eb22e3eab29816f717512d9d::router::swap_exact_coin_y_for_coin_x',
      typeArguments: [coinTypeTarget, coinTypeSource],
      arguments: moveArgs,
    });
  }
};
