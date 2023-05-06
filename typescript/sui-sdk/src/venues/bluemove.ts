
import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCoinZero } from '../utils';

export const moveCallBluemove = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.target_coin;

  console.log({ coinTypeSource, coinTypeTarget });

  // TODO: Fix it and do temporary for router::swap_exact_input
  const source_amount = venue.source_amount * 0.995;

  const targetCoin = moveCallCoinZero(txb, coinTypeTarget);

  console.log({ sourceCoin, targetCoin });

  // return txb.moveCall({
  //   target: '0xb24b6789e088b876afabca733bed2299fbc9e2d6369be4d1acfa17d8145454d9::router::swap_exact_input_',
  //   typeArguments: [coinTypeSource, coinTypeTarget],
  //   arguments: [
  //     txb.pure(source_amount),
  //     sourceCoin,
  //     txb.pure(0),
  //     maybeFindOrCreateObject(txb, '0x3f2d9f724f4a1ce5e71676448dc452be9a6243dac9c5b975a588c8c867066e92'),
  //   ],
  // });
  return txb.moveCall({
    target: '0xb24b6789e088b876afabca733bed2299fbc9e2d6369be4d1acfa17d8145454d9::router::swap_exact_output_',
    typeArguments: [coinTypeSource, coinTypeTarget],
    arguments: [
      txb.pure(0), // desired output
      txb.pure(source_amount), // max input
      sourceCoin, // input coin
      maybeFindOrCreateObject(txb, '0x3f2d9f724f4a1ce5e71676448dc452be9a6243dac9c5b975a588c8c867066e92'),
    ],
  });
};
