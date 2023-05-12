import {
  Connection,
  Ed25519Keypair,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
  fromB64,
} from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { maybeFindOrCreateObject, moveCallCoinValue, moveCallWithdrawCoin } from '../src';

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
const SSWP =
  '0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc::TOKEN::TOKEN';

const txb = new TransactionBlock();
const owner = txb.pure(address);

const sourceAmount = 1_000_000;
const coin_s = await moveCallWithdrawCoin({
  provider,
  owner: address,
  coinType: SUI,
  requiredAmount: sourceAmount,
  txb,
});

const [sourceOutputCoin, targetOutputCoin] = txb.moveCall({
  target:
    '0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc::pool::do_swap_y_to_x_direct',
  typeArguments: [SSWP, SUI],
  arguments: [
    maybeFindOrCreateObject(
      txb,
      '0x40feddc72ac48743e4f3687b5775bb78c9524ddafd9ba2333d748a89cef4df74'
    ),
    txb.makeMoveVec({ objects: [coin_s] }),
    moveCallCoinValue({ txb, coinType: SUI, coin: coin_s }),
    maybeFindOrCreateObject(txb, '0x6'),
  ],
});

txb.transferObjects([sourceOutputCoin, targetOutputCoin], owner);

const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});

console.log(dryRunResult);
