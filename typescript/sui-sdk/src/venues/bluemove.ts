import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCoinValue } from '../utils';

export const moveCallBluemove = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin_type;
  const coinTypeTarget = venue.target_coin_type;

  console.log({ coinTypeSource, coinTypeTarget });

  return txb.moveCall({
    target: '0xb24b6789e088b876afabca733bed2299fbc9e2d6369be4d1acfa17d8145454d9::router::swap_exact_input_',
    typeArguments: [coinTypeSource, coinTypeTarget],
    arguments: [
      moveCallCoinValue({ txb, coinType: coinTypeSource, coin: sourceCoin }),
      sourceCoin,
      txb.pure(0),
      maybeFindOrCreateObject(txb, '0x3f2d9f724f4a1ce5e71676448dc452be9a6243dac9c5b975a588c8c867066e92'),
    ],
  });
};
