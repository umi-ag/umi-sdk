import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';

const GLOBAL_CONFIG_ID = '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f';

export const moveCallCetus = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.target_coin;

  const typeArguments = venue.is_x_to_y
    ? [coinTypeSource, coinTypeTarget]
    : [coinTypeTarget, coinTypeSource];

  const functionName = venue.is_x_to_y
    ? '0xa9a230dd94cc5ef225bc553e9bc02d9000a6b5f965a8ea65d25630cc3ca2a3a8::umi_aggregator_with_cetus::swap_x'
    : '0xa9a230dd94cc5ef225bc553e9bc02d9000a6b5f965a8ea65d25630cc3ca2a3a8::umi_aggregator_with_cetus::swap_y';

  const targetCoin = txb.moveCall({
    target: functionName,
    typeArguments,
    arguments: [
      maybeFindOrCreateObject(txb, GLOBAL_CONFIG_ID), // GlobalConfig
      maybeFindOrCreateObject(txb, venue.object_id), // Pool
      sourceCoin,
      maybeFindOrCreateObject(txb, '0x6'), // Clock
    ],
  });

  return targetCoin;
};
