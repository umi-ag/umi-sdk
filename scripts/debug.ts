import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, fromB64 } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { dev_fetchSplitQuotes } from '../src/api';
import { createTradeTransactionBlockFromRoute } from '../src/core/createTransactionBlock';

globalThis.fetch = fetch;

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';

const provider = new JsonRpcProvider(new Connection({
  fullnode: 'https://sui-api.rpcpool.com',
}));

const privatekey0x = (process.env.SUI_PRIVATE_KEY as string); // 0x.....
const privatekey = privatekey0x.replace(/^0x/, ''); //slice used to remove the first 2 letter from the string and that's 0x
const privateKeyBase64 = Buffer.from(privatekey, 'hex').toString('base64'); //convert hex to base64 string
const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));
// const mnemonic = process.env.SUI_MNEMONIC as string;
// const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
// console.log(keypair.getPublicKey().toSuiAddress());
const signer = new RawSigner(keypair, provider);
const owner = keypair.getPublicKey().toSuiAddress();
console.log(await signer.getAddress());

// eslint-disable-next-line @typescript-eslint/no-extra-semi, no-extra-semi
;(async () => {
  console.time('p');
  const [quote] = await dev_fetchSplitQuotes({
    sourceCoin: devUSDC,
    targetCoin: devBTC,
    inputAmount: 3,
  });
  console.timeLog('p', 'quote');

  const coins = (await provider.getCoins({ owner, coinType: devUSDC }))
    .data;
  console.timeLog('p', 'coins');
  const r = createTradeTransactionBlockFromRoute(
    owner,
    quote,
    coins,
    {
      slippageTolerance: 0.01,
    }
  );
  console.timeLog('p', 'txb');

  if (r.isErr()) {
    console.error(r.error);
    return;
  }

  const txb = r.value;
  // console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));

  const dryRunResult = await signer.dryRunTransactionBlock({
    transactionBlock: txb,
  });
  // console.log(JSON.stringify(dryRunResult, null, 2));
  console.timeEnd('p');

  // const result = await signer.signAndExecuteTransactionBlock({
  //   transactionBlock: txb,
  //   options: {
  //     showBalanceChanges: true,
  //     showObjectChanges: true,
  //     showEffects: true,
  //     showEvents: true,
  //     showInput: true,
  //   },
  // });
  // console.log(JSON.stringify(result, null, 2));
  // console.log(result.digest);
})();
