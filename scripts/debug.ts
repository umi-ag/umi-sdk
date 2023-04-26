import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { dev_fetchSplitQuotes } from '../src/api';
import { makeTxbFromRoute } from '../src/utils/makeTransactionBlock';

globalThis.fetch = fetch;

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';

const provider = new JsonRpcProvider(new Connection({
  fullnode: 'https://sui-api.rpcpool.com',
}));

const mnemonic = process.env.SUI_MNEMONIC as string;
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
// console.log(keypair.getPublicKey().toSuiAddress());
const signer = new RawSigner(keypair, provider);
const owner = keypair.getPublicKey().toSuiAddress();

// eslint-disable-next-line @typescript-eslint/no-extra-semi, no-extra-semi
;(async () => {
  const sourceAmount = 3;
  const [quote] = await dev_fetchSplitQuotes({
    sourceCoin: devUSDC,
    targetCoin: devBTC,
    inputAmount: 3,
  });

  const coins = (await provider.getCoins({ owner, coinType: devUSDC }))
    .data;
  const r = makeTxbFromRoute(
    owner,
    sourceAmount,
    quote,
    0,
    coins,
  );

  if (r.isErr()) {
    console.error(r.error);
    return;
  }

  const txb = r.value;
  console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));

  const result = await signer.dryRunTransactionBlock({
    transactionBlock: txb,
  });
  console.log(JSON.stringify(result, null, 2));

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
})();
