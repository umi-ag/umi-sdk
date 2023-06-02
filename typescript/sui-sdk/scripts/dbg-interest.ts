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

const DEX_STORAGE_ID = "0xdf2ee39f28fdf4bc5d5b5dc89926ac121839f8594fa51b2383a14cb99ab25a77";

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

const targetOutputCoin = txb.moveCall({
  target:
    '0x5c45d10c26c5fb53bfaff819666da6bc7053d2190dfa29fec311cc666ff1f4b0::router::swap_token_y',
  typeArguments: [SUI, USDCw],
  arguments: [
    maybeFindOrCreateObject(txb, DEX_STORAGE_ID),
    maybeFindOrCreateObject(txb, '0x6'),
    coin_s,
    txb.pure(0),
  ],
});

txb.transferObjects([targetOutputCoin], owner);

const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});

console.log(dryRunResult);
