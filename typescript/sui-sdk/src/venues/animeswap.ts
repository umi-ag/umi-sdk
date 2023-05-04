
import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';

export const moveCallAnimeswap = (
  txb: TransactionBlock,
  venue: Venue,
  coin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.source_coin;

  return txb.moveCall({
    target: '0x88d362329ede856f5f67867929ed570bba06c975abec2fab7f0601c56f6a8cb1::animeswap::swap_exact_coins_for_coins_entry',
    typeArguments: [coinTypeSource, coinTypeTarget],
    arguments: [
      txb.pure(venue.object_id),
      maybeFindOrCreateObject(txb, '0x6'), // clock
      coin,
      txb.pure(venue.source_amount),
      txb.pure(0),
    ]
  });
};
