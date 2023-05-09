import {
  Connection,
  Ed25519Keypair,
  fromB64,
  JsonRpcProvider,
  RawSigner
} from '@mysten/sui.js';
import fetch from 'cross-fetch';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: 'https://fullnode.mainnet.sui.io',
  }),
);

const keypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string; // 0x.....
  const privatekey = privatekey0x.replace(/^0x/, ''); //slice used to remove the first 2 letter from the string and that's 0x
  // const privateKeyBase64 = Buffer.from(privatekey, 'hex').toString('base64'); //convert hex to base64 string
  const privateKeyBase64 = "APbs/OhEObsFzS06cuRO33u7l1ebslYfQm/35Yq8kvz8"
  // const privateKeyBase64 = "AJrW6JwDqbDOd6C3nycVxRoJQMLGOvpJgX0LusCTbCGb"
  let Key =fromB64(privateKeyBase64).slice(1)
  console.log({ Key})
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64).slice(1));
  // const mnemonic = process.env.SUI_MNEMONIC as string;
  // return Ed25519Keypair.deriveKeypair(mnemonic);
};
const signer = new RawSigner(keypair(), provider);
const address = await signer.getAddress();
console.log({ address });
