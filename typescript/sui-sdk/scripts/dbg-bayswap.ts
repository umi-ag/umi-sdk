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
const BSWT =
  '0xf0fe2210b4f0c4e3aff7ed147f14980cf14f1114c6ad8fd531ab748ccf33373b::bswt::BSWT';

const CURVE_TYPE = '0x227f865230dd4fc947321619f56fee37dc7ac582eb22e3eab29816f717512d9d::curves::Uncorrelated';

const DEX_STORAGE_ID = '0x53568bcc281b720f257e53397b45228186cc3f47e714ab2ab5afea87af7ed903';

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

const sourceAmountResult = moveCallCoinValue({ txb, coinType: SUI, coin: coin_s });

const targetOutputCoin = txb.moveCall({
  target:
    '0x227f865230dd4fc947321619f56fee37dc7ac582eb22e3eab29816f717512d9d::router::swap_exact_coin_x_for_coin_y',
  typeArguments: [SUI, BSWT, CURVE_TYPE],
  arguments: [
    maybeFindOrCreateObject(txb, DEX_STORAGE_ID),
    coin_s,
    sourceAmountResult,
  ],
});

txb.transferObjects([targetOutputCoin], owner);

const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});

console.log(dryRunResult);