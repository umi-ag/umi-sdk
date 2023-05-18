import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock, fromB64 } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { maybeFindOrCreateObject, moveCallCoinZero, moveCallWithdrawCoin } from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: 'https://fullnode.mainnet.sui.io',
  }),
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

// const SUI = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
const WETHw = '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN';
// const USDTw = '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN';
const USDCw = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';

const txb = new TransactionBlock();

const eth = moveCallCoinZero(txb, WETHw);
console.log({ eth });

const usdc = await moveCallWithdrawCoin({
  provider,
  owner: address,
  coinType: USDCw,
  requiredAmount: 1000,
  txb,
});

console.log({ eth, usdc });

const [usdcAfter, ethAfter] = txb.moveCall({
  target: '0x88d362329ede856f5f67867929ed570bba06c975abec2fab7f0601c56f6a8cb1::animeswap::swap_coins_for_coins',
  typeArguments: [USDCw, WETHw],
  arguments: [
    maybeFindOrCreateObject(txb, '0xdd7e3a071c6a090a157eccc3c9bbc4d2b3fb5ac9a4687b1c300bf74be6a58945'), // pool,
    maybeFindOrCreateObject(txb, '0x6'), // clock
    usdc,
    eth,
  ],
});

txb.transferObjects([usdcAfter, ethAfter], txb.pure(address));

// txb.moveCall({
//   target: '0x88d362329ede856f5f67867929ed570bba06c975abec2fab7f0601c56f6a8cb1::animeswap::swap_coins_for_coins',
//   typeArguments: [WETHw, USDTw],
//   arguments: [
//     maybeFindOrCreateObject(txb, '0xdd7e3a071c6a090a157eccc3c9bbc4d2b3fb5ac9a4687b1c300bf74be6a58945'), // pool,
//     maybeFindOrCreateObject(txb, '0x6'), // clock
//     eth,
//     usdt,
//   ],
// });

const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});

console.log(dryRunResult);
