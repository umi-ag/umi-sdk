import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCoinZero, moveCallMaybeTransferOrDestroyCoin } from '../utils';

export const moveCallAnimeswap = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.target_coin;

  // console.log({ coinTypeSource, coinTypeTarget });

  const typeArguments = venue.is_x_to_y
    ? [coinTypeSource, coinTypeTarget]
    : [coinTypeTarget, coinTypeSource];

  const targetCoin = moveCallCoinZero(txb, coinTypeTarget);

  // console.log({ sourceCoin, targetCoin });

  const moveArgs = venue.is_x_to_y
    ? [
      maybeFindOrCreateObject(txb, '0xdd7e3a071c6a090a157eccc3c9bbc4d2b3fb5ac9a4687b1c300bf74be6a58945'), // pool,
      maybeFindOrCreateObject(txb, '0x6'), // clock
      sourceCoin,
      targetCoin,
    ] : [
      maybeFindOrCreateObject(txb, '0xdd7e3a071c6a090a157eccc3c9bbc4d2b3fb5ac9a4687b1c300bf74be6a58945'), // pool,
      maybeFindOrCreateObject(txb, '0x6'), // clock
      targetCoin,
      sourceCoin,
    ];

  //   public swap_coins_for_coins<Ty0, Ty1>(
  //     Arg0: &mut LiquidityPools,
  //     Arg1: &Clock,
  //     Arg2: Coin<Ty0>,
  //     Arg3: Coin<Ty1>,
  //     Arg4: &mut TxContext
  //   ): Coin<Ty0> * Coin<Ty1> {
  const [coinX, coinY] = txb.moveCall({
    target: '0x88d362329ede856f5f67867929ed570bba06c975abec2fab7f0601c56f6a8cb1::animeswap::swap_coins_for_coins',
    typeArguments,
    arguments: moveArgs,
  });

  if (venue.is_x_to_y) {
    moveCallMaybeTransferOrDestroyCoin({
      txb,
      coinType: typeArguments[0],
      coin: coinX,
    });
    return coinY;
  } else {
    moveCallMaybeTransferOrDestroyCoin({
      txb,
      coinType: typeArguments[1],
      coin: coinY,
    });
    return coinX;
  }
};
