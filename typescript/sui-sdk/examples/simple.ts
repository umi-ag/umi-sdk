import { Ed25519Keypair, JsonRpcProvider, RawSigner, fromB64, testnetConnection } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { fetchQuoteAndBuildTransactionBlockForUmiAgTrade } from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(testnetConnection);

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

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';

(async () => {
  const txb = await fetchQuoteAndBuildTransactionBlockForUmiAgTrade({
    provider,
    accountAddress: address,
    sourceCoinType: devBTC,
    targetCoinType: devUSDC,
    sourceAmount: 1000n,
    slippageTolerance: 0.01, // 1%
  });

  const result = await signer.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    options: {
      showBalanceChanges: true,
    },
  });

  console.log(result.balanceChanges);
  console.log(result.digest);
})();
