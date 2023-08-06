import { TransactionBlock } from '@mysten/sui.js';
import { findObjectByType, moveCallMaybeTransferOrDestroyCoin, moveCallWithdrawCoin } from '../src';
import { moveCallDeepBook } from '../src/venues/deepbook';
import { SUI, USDCw, address, provider, signer } from './common';

const LOT_SIZE = 1e8;
// const SOURCE_AMOUNT = LOT_SIZE * 1000 + 1;
const SOURCE_AMOUNT = 223456789;

const txb = new TransactionBlock();

const sui = await moveCallWithdrawCoin({
  provider,
  owner: address,
  coinType: SUI,
  requiredAmount: SOURCE_AMOUNT,
  txb,
});

const accountCap = await findObjectByType({
  txb,
  type: '0xdee9::custodian_v2::AccountCap',
  provider,
  owner: address,
});

console.log({ accountCap });

const usdc = moveCallDeepBook(
  txb,
  {
    name: 'deepbook',
    object_id: '0x7f526b1263c4b91b43c9e646419b5696f424de28dda3c1e6658cc0a54558baa7',
    source_coin_type: SUI,
    target_coin_type: USDCw,
    is_x_to_y: true,
    function: 'a::b::c',
    object_type: 'x',
    source_amount: 0,
    source_fee: 0,
    target_amount: 0,
    target_fee: 0,
  },
  sui,
  accountCap ?? null,
);

moveCallMaybeTransferOrDestroyCoin({
  txb,
  coinType: USDCw,
  coin: usdc,
});

// printTxb(txb);
const r = await signer.dryRunTransactionBlock({ transactionBlock: txb });
console.log(JSON.stringify(r, null, 2));
