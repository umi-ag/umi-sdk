import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCoinZero } from '../utils';

export const moveCallDeepBook = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
  accountCapCandidate?: TransactionArgument,
) => {
  const accountCap = accountCapCandidate ?? txb.moveCall({
    target: '0xdee9::clob_v2::create_account_cap',
  });

  return venue.is_x_to_y
    // public fun swap_exact_base_for_quote<BaseAsset, QuoteAsset>(
    //     pool: &mut Pool<BaseAsset, QuoteAsset>,
    //     client_order_id: u64,
    //     account_cap: &AccountCap,
    //     quantity: u64,
    //     base_coin: Coin<BaseAsset>,
    //     quote_coin: Coin<QuoteAsset>,
    //     clock: &Clock,
    //     ctx: &mut TxContext,
    // )
    ? txb.moveCall({
      target: '0xdee9::clob_v2::swap_exact_base_for_quote',
      typeArguments: [venue.source_coin, venue.target_coin],
      arguments: [
        maybeFindOrCreateObject(txb, venue.object_id),
        txb.pure(0), // client_order_id (arbitrary)
        accountCap,
        txb.pure(1), // quantity
        sourceCoin,
        moveCallCoinZero(txb, venue.target_coin),
        maybeFindOrCreateObject(txb, '0x6'),
      ]
    })
    // public fun swap_exact_quote_for_base<BaseAsset, QuoteAsset>(
    //     pool: &mut Pool<BaseAsset, QuoteAsset>,
    //     client_order_id: u64,
    //     account_cap: &AccountCap,
    //     quantity: u64,
    //     clock: &Clock,
    //     quote_coin: Coin<QuoteAsset>,
    //     ctx: &mut TxContext,
    // )
    : txb.moveCall({
      target: '0xdee9::clob_v2::swap_exact_quote_for_base',
      typeArguments: [venue.target_coin, venue.source_coin],
      arguments: [
        maybeFindOrCreateObject(txb, venue.object_id),
        txb.pure(0), // client_order_id (arbitrary)
        accountCap,
        txb.pure(1), // quantity
        maybeFindOrCreateObject(txb, '0x6'),
        sourceCoin,
      ]
    });
};
