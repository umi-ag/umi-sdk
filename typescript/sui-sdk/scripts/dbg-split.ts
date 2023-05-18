import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock, fromB64 } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { moveCallSplitCoinByWeights, moveCallWithdrawCoin } from '../src';

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

const SUI = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';

const txb = new TransactionBlock();
const owner = txb.pure(address);

const sourceAmount = 1000;

const sui = await moveCallWithdrawCoin({
  txb,
  coinType: SUI,
  owner: address,
  provider,
  requiredAmount: sourceAmount,
});

const coins = moveCallSplitCoinByWeights({
  txb,
  coinType: SUI,
  coins: [sui],
  weights: [4000, 6000], // bps
});

txb.transferObjects(coins, owner);

console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));
const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});

console.log(dryRunResult);
