
import { Ed25519Keypair, JsonRpcProvider, RawSigner, fromB64, testnetConnection } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { fetchQuoteAndBuildTransactionBlockForUmiTrade } from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(testnetConnection);
const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';
const keypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string; // 0x.....
  const privatekey = privatekey0x.replace(/^0x/, ''); //slice used to remove the first 2 letter from the string and that's 0x
  const privateKeyBase64 = Buffer.from(privatekey, 'hex').toString('base64'); //convert hex to base64 string
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));

  // const mnemonic = process.env.SUI_MNEMONIC as string;
  // return Ed25519Keypair.deriveKeypair(mnemonic);
};
const signer = new RawSigner(keypair(), provider);

async function main() {
  const accountAddress = await signer.getAddress();
  const txb = await fetchQuoteAndBuildTransactionBlockForUmiTrade({
    provider,
    accountAddress,
    sourceCoinType: devBTC,
    targetCoinType: devUSDC,
    sourceAmount: BigInt(1000),
    slippageTolerance: 0.01, // 1%
  });
  const dryRunResult = await signer.dryRunTransactionBlock({
    transactionBlock: txb,
  });
  console.log(dryRunResult.balanceChanges);
}

main();
