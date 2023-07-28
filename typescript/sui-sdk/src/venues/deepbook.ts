import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { maybeFindOrCreateObject } from '../core';
import type { Venue } from '../types';
import { moveCallCalcQuantity, moveCallCoinZero, moveCallMaybeTransferOrDestroyCoin } from '../utils';

export const getLotSize = (coinTypeSource: string, coinTypeTarget: string) => {
  const pair = [coinTypeSource, coinTypeTarget].sort().join('/');

  const SUI = '0x2::sui::SUI';
  const USDCw = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
  const USDTw = '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN';

  return {
    [`${SUI}/${USDCw}`]: 1e8,
    [`${USDCw}/${USDTw}`]: 1e6,
  }[pair];
};

export const moveCallDeepBook = (
  txb: TransactionBlock,
  venue: Venue,
  sourceCoin: TransactionArgument,
  accountCapCandidate?: TransactionArgument,
) => {
  const accountCap = accountCapCandidate ?? txb.moveCall({
    target: '0xdee9::clob_v2::account_cap',
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
      coinType: venue.source_coin,
      coin: sourceCoin,
      lotSize: getLotSize(venue.source_coin, venue.target_coin),
    });

    const [baseCoin, quoteCoin] = txb.moveCall({
      target: '0xdee9::clob_v2::swap_exact_base_for_quote',
      typeArguments: [venue.source_coin, venue.target_coin],
      arguments: [
        maybeFindOrCreateObject(txb, venue.object_id),
        txb.pure(0), // client_order_id (arbitrary)
        accountCap,
        quantity,
        sourceCoin,
        moveCallCoinZero(txb, venue.target_coin),
        maybeFindOrCreateObject(txb, '0x6'),
      ]
    });

    moveCallMaybeTransferOrDestroyCoin({ txb, coinType: venue.source_coin, coin: baseCoin });
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
    coinType: venue.source_coin,
    coin: sourceCoin,
    lotSize: getLotSize(venue.target_coin, venue.source_coin),
  });
  const [baseCoin, quoteCoin] = txb.moveCall({
    target: '0xdee9::clob_v2::swap_exact_quote_for_base',
    typeArguments: [venue.target_coin, venue.source_coin],
    arguments: [
      maybeFindOrCreateObject(txb, venue.object_id),
      txb.pure(0), // client_order_id (arbitrary)
      accountCap,
      quantity,
      maybeFindOrCreateObject(txb, '0x6'),
      sourceCoin,
    ]
  });
  moveCallMaybeTransferOrDestroyCoin({ txb, coinType: venue.source_coin, coin: quoteCoin });
  return baseCoin;
};
