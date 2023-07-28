import type { TransactionBlock } from '@mysten/sui.js';
import { Ed25519Keypair, JsonRpcProvider, RawSigner, fromB64, mainnetConnection } from '@mysten/sui.js';
import fetch from 'cross-fetch';

globalThis.fetch = fetch;

export const provider = new JsonRpcProvider(mainnetConnection);
export const keypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string; // 0x.....
  const privatekey = privatekey0x.replace(/^0x/, ''); //slice used to remove the first 2 letter from the string and that's 0x
  const privateKeyBase64 = Buffer.from(privatekey, 'hex').toString('base64'); //convert hex to base64 string
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));
  // const mnemonic = process.env.SUI_MNEMONIC as string;
  // return Ed25519Keypair.deriveKeypair(mnemonic);
};
export const signer = new RawSigner(keypair(), provider);
export const address = await signer.getAddress();
console.log({ address });

export const SUI = '0x2::sui::SUI';
export const WETHw =
  '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN';
export const USDTw =
  '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN';
export const USDCw =
  '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
export const SSWP =
  '0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc::TOKEN::TOKEN';

export const printTxb = (txb: TransactionBlock) => {
  console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));
};
