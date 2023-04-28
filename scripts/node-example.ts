import { Ed25519Keypair, JsonRpcProvider, RawSigner, testnetConnection } from '@mysten/sui.js';
import { UmiSDK } from '../src';

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';

// eslint-disable-next-line @typescript-eslint/no-extra-semi, no-extra-semi
;(async () => {
  const provider = new JsonRpcProvider(testnetConnection);

  const mnemonic = process.env.SUI_MNEMONIC as string;
  const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
  const signer = new RawSigner(keypair, provider);

  const umi = new UmiSDK({
    userAddress: keypair.getPublicKey().toSuiAddress(),
    signer,
  });

  const [route] = await umi.fetchTradingRoutes({
    sourceCoin: devBTC,
    targetCoin: devUSDC,
    inputAmount: 1000,
  });

  const result = await umi.executeRoute(route, { slippageTolerance: 0.01 });
  console.log(result.digest);
})();
