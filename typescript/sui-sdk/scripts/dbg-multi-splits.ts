import { Ed25519Keypair, JsonRpcProvider, RawSigner, fromB64, mainnetConnection } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { readFileSync } from 'fs';
import { buildTransactionBlockForUmiAgSwap, fetchTradingAmountListAndFee } from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(mainnetConnection);
const keypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string; // 0x.....
  const privatekey = privatekey0x.replace(/^0x/, ''); //slice used to remove the first 2 letter from the string and that's 0x
  const privateKeyBase64 = Buffer.from(privatekey, 'hex').toString('base64'); //convert hex to base64 string
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));
};
const signer = new RawSigner(keypair(), provider);
const address = await signer.getAddress();

const json = readFileSync('./scripts/quote1.json', 'utf8');
const quote1 = JSON.parse(json);

const SUI = '0x2::sui::SUI';
const WETHw = '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN';
const USDTw = '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN';
const USDCw = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
const SOURCE_AMOUNT = 50e9 + 1;
const SLIPPAGE_TOLERANCE = 1; // 1%

// const [quote1] = await fetchQuoteFromUmi({
//   // sourceCoin: SUI,
//   // targetCoin: USDCw,
//   sourceCoin: USDCw,
//   targetCoin: SUI,
//   // targetCoin: WETHw,
//   sourceAmount: SOURCE_AMOUNT,
// });
console.log(JSON.stringify(quote1, null, 2));

const txb = await buildTransactionBlockForUmiAgSwap({
  // transactionBlock: txb,
  accountAddress: address,
  provider,
  quote: quote1,
  slippageTolerance: SLIPPAGE_TOLERANCE,
});
console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));

const r = await fetchTradingAmountListAndFee({
  provider,
  transactionBlock: txb,
  senderAddress: address,
});

console.log(JSON.stringify(r, null, 2));
