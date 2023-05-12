import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import {
  moveCallMaybeTransferOrDestroyCoin,
} from '../utils';

export const moveCallSuiswap = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.target_coin;

  const moveArgs = [
    maybeFindOrCreateObject(txb, venue.object_id), // pool
    sourceCoin,
    maybeFindOrCreateObject(txb, '0x6'), // clock
  ];

  let coinX, coinY;
  if (venue.is_x_to_y) {
    [coinX, coinY] = txb.moveCall({
      target: '0xb74af4143693f5df0e9d57fa225fda5394b30caa85e06a501c3d0be7a3acc9ba::suiswap::swap_x',
      typeArguments: [coinTypeSource, coinTypeTarget],
      arguments: moveArgs,
    });
    moveCallMaybeTransferOrDestroyCoin({
      txb,
      coinType: coinTypeSource,
      coin: coinX,
    });
    return coinY;
  } else {
    [coinX, coinY] = txb.moveCall({
      target: '0xb74af4143693f5df0e9d57fa225fda5394b30caa85e06a501c3d0be7a3acc9ba::suiswap::swap_y',
      typeArguments: [coinTypeTarget, coinTypeSource],
      arguments: moveArgs,
    });
    moveCallMaybeTransferOrDestroyCoin({
      txb,
      coinType: coinTypeSource,
      coin: coinY,
    });
    return coinX;
  }
};
