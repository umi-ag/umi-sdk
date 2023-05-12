import type { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { maybeFindOrCreateObject } from "../core";
import type { Venue } from "../types";
import {
	moveCallCoinValue,
	moveCallMaybeTransferOrDestroyCoin,
} from "../utils";

export const moveCallSuiswap = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument
) => {
  const coinTypeSource = venue.source_coin;
  const coinTypeTarget = venue.target_coin;

  console.log({ coinTypeSource, coinTypeTarget });
	console.log({ venue });

	const sourceCoins: TransactionArgument[] = [sourceCoin];

  const moveArgs = [
    maybeFindOrCreateObject(txb, venue.object_id), // pool
    txb.makeMoveVec({ objects: sourceCoins }),
		// [sourceCoin],
    moveCallCoinValue({ txb, coinType: coinTypeSource, coin: sourceCoin }),
    maybeFindOrCreateObject(txb, "0x6"),
  ];

  // public fun do_swap_x_to_y_direct<X, Y>(
  //     pool: &mut Pool<X, Y>,
  //     cxs: vector<Coin<X>>,
  //     in_amount: u64,
  //     ctx: &mut TxContext
  // ): (Coin<X>, Coin<Y>) {

  // public do_swap_x_to_y_direct<Ty0, Ty1>(
  //     Arg0: &mut Pool<Ty0, Ty1>,
  //     Arg1: vector<Coin<Ty0>>,
  //     Arg2: u64,
  //     Arg3: &Clock,
  //     Arg4: &mut TxContext
  // ): Coin<Ty0> * Coin<Ty1>

  // public do_swap_y_to_x_direct<Ty0, Ty1>(
  //     Arg0: &mut Pool<Ty0, Ty1>,
  //     Arg1: vector<Coin<Ty1>>,
  //     Arg2: u64,
  //     Arg3: &Clock,
  //     Arg4: &mut TxContext
  // ): Coin<Ty1> * Coin<Ty0> {

  const [sourceOutputCoin, targetOutputCoin] = venue.is_x_to_y
    ? txb.moveCall({
        target:
          "0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc::pool::do_swap_x_to_y_direct",
        typeArguments: [coinTypeSource, coinTypeTarget],
        arguments: moveArgs,
      })
    : txb.moveCall({
        target:
          "0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc::pool::do_swap_y_to_x_direct",
        typeArguments: [coinTypeTarget, coinTypeSource],
        arguments: moveArgs,
      });

  moveCallMaybeTransferOrDestroyCoin({
    txb,
    coinType: coinTypeSource,
    coin: sourceOutputCoin,
  });

  return targetOutputCoin;
};
