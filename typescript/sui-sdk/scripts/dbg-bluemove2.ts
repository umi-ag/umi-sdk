import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock, fromB64 } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { maybeFindOrCreateObject, moveCallWithdrawCoin } from '../src';

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

const USD = '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN';
const SMOVE = '0xd9f9b0b4f35276eecd1eea6985bfabe2a2bbd5575f9adb9162ccbdb4ddebde7f::smove::SMOVE';

const txb = new TransactionBlock();
const owner = txb.pure(address);

const sourceAmount = 10_000;
const coin_s = await moveCallWithdrawCoin({
  provider,
  owner: address,
  coinType: SMOVE,
  requiredAmount: sourceAmount,
  txb,
});

const coin_t = txb.moveCall({
  target: '0xb24b6789e088b876afabca733bed2299fbc9e2d6369be4d1acfa17d8145454d9::router::swap_exact_input_',
  typeArguments: [SMOVE, USD],
  arguments: [
    txb.pure(sourceAmount),
    coin_s,
    txb.pure(0),
    maybeFindOrCreateObject(txb, '0x3f2d9f724f4a1ce5e71676448dc452be9a6243dac9c5b975a588c8c867066e92'),
  ],
});

txb.transferObjects([coin_t], owner);

const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});

console.log(dryRunResult);
