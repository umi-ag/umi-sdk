import {
  Connection,
  Ed25519Keypair,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
  fromB64,
} from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { maybeFindOrCreateObject, moveCallWithdrawCoin } from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: 'https://fullnode.mainnet.sui.io',
  })
);

const keypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string; // 0x.....
  const privatekey = privatekey0x.replace(/^0x/, ''); //slice used to remove the first 2 letter from the string and that's 0x
  const privateKeyBase64 = Buffer.from(privatekey, 'hex').toString('base64'); //convert hex to base64 string
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));
  // const mnemonic = process.env.SUI_MNEMONIC as string;
  // return Ed25519Keypair.deriveKeypair(mnemonic);
};
const signer = new RawSigner(keypair(), provider);
const address = await signer.getAddress();
console.log({ address });

const SUI = '0x2::sui::SUI';
const USDCw =
  '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';

// https://suiexplorer.com/object/0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688630
const PoolId = '0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688630';
const GlobalConfigId = '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f';

const txb = new TransactionBlock();
const owner = txb.pure(address);

const sourceAmount = 1_000_000;
const coin_s = await moveCallWithdrawCoin({
  provider,
  owner: address,
  coinType: USDCw,
  requiredAmount: sourceAmount,
  txb,
});

const targetCoin = txb.moveCall({
  target: '0xa9a230dd94cc5ef225bc553e9bc02d9000a6b5f965a8ea65d25630cc3ca2a3a8::umi_aggregator_with_cetus::swap_x',
  typeArguments: [USDCw, SUI],
  arguments: [
    maybeFindOrCreateObject(txb, GlobalConfigId), // GlobalConfig
    maybeFindOrCreateObject(txb, PoolId), // Pool
    coin_s,
    maybeFindOrCreateObject(txb, '0x6'), // Clock
  ],
});

txb.transferObjects([targetCoin], owner);

const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});

console.log(dryRunResult);
