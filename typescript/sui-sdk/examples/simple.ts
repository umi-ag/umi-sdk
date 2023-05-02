import { Ed25519Keypair, JsonRpcProvider, RawSigner, testnetConnection } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { fetchQuoteAndBuildTransactionBlockForUmiAgTrade } from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(testnetConnection);

const mnemonic = process.env.SUI_MNEMONIC as string;
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
const signer = new RawSigner(keypair, provider);
const accountAddress = await signer.getAddress();

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';

(async () => {
  const txb = await fetchQuoteAndBuildTransactionBlockForUmiAgTrade({
    provider,
    accountAddress,
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
