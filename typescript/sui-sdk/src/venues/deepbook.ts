import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCalcQuantity, moveCallCoinZero, moveCallMaybeTransferOrDestroyCoin } from '../utils';

export const getLotSize = (poolId: string) => {
  const SUI_USDCw = '0x7f526b1263c4b91b43c9e646419b5696f424de28dda3c1e6658cc0a54558baa7';
  const USDTw_USDCw = '0x5deafda22b6b86127ea4299503362638bea0ca33bb212ea3a67b029356b8b955';

  const lotSize = {
    [SUI_USDCw]: 1e8,
    [USDTw_USDCw]: 1e6,
  }[poolId];

  return lotSize ?? 0;
};

export const moveCallDeepBook = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
  accountCapCandidate: TransactionArgument | null,
) => {
  const accountCap = accountCapCandidate ?? txb.moveCall({
    target: '0xdee9::clob_v2::create_account',
  });

  // public fun swap_exact_base_for_quote<BaseAsset, QuoteAsset>(
  //     pool: &mut Pool<BaseAsset, QuoteAsset>,
  //     client_order_id: u64,
  //     account_cap: &AccountCap,
  //     quantity: u64,
  //     base_coin: Coin<BaseAsset>,
  //     quote_coin: Coin<QuoteAsset>,
  //     clock: &Clock,
  //     ctx: &mut TxContext,
  // ): (Coin<BaseAsset>, Coin<QuoteAsset>, u64)
  if (venue.is_x_to_y) {
    const quantity = moveCallCalcQuantity({
      txb,
      coinType: venue.source_coin_type,
      coin: sourceCoin,
      lotSize: getLotSize(venue.object_id),
    });

    const [baseCoin, quoteCoin] = txb.moveCall({
      target: '0xdee9::clob_v2::swap_exact_base_for_quote',
      typeArguments: [venue.source_coin_type, venue.target_coin_type],
      arguments: [
        maybeFindOrCreateObject(txb, venue.object_id),
        txb.pure(0), // client_order_id (arbitrary)
        accountCap,
        quantity,
        sourceCoin,
        moveCallCoinZero(txb, venue.target_coin_type),
        maybeFindOrCreateObject(txb, '0x6'),
      ]
    });

    moveCallMaybeTransferOrDestroyCoin({ txb, coinType: venue.source_coin_type, coin: baseCoin });
    return quoteCoin;
  }

  // public fun swap_exact_quote_for_base<BaseAsset, QuoteAsset>(
  //     pool: &mut Pool<BaseAsset, QuoteAsset>,
  //     client_order_id: u64,
  //     account_cap: &AccountCap,
  //     quantity: u64,
  //     clock: &Clock,
  //     quote_coin: Coin<QuoteAsset>,
  //     ctx: &mut TxContext,
  // ): (Coin<BaseAsset>, Coin<QuoteAsset>, u64)
  const quantity = moveCallCalcQuantity({
    txb,
    coinType: venue.source_coin_type,
    coin: sourceCoin,
    lotSize: getLotSize(venue.object_id),
  });
  const [baseCoin, quoteCoin] = txb.moveCall({
    target: '0xdee9::clob_v2::swap_exact_quote_for_base',
    typeArguments: [venue.target_coin_type, venue.source_coin_type],
    arguments: [
      maybeFindOrCreateObject(txb, venue.object_id),
      txb.pure(0), // client_order_id (arbitrary)
      accountCap,
      quantity,
      maybeFindOrCreateObject(txb, '0x6'),
      sourceCoin,
    ]
  });
  moveCallMaybeTransferOrDestroyCoin({ txb, coinType: venue.source_coin_type, coin: quoteCoin });
  return baseCoin;
};
