import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock, getTotalGasUsed } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { getSufficientCoinObjects, umiAggregatorMoveCall, fetchQuotes } from '../src';
import { findCoinByType } from '@umi-ag/sui-coin-list';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(new Connection({
  fullnode: 'https://sui-api.rpcpool.com',
}));

const mnemonic = process.env.SUI_MNEMONIC as string;
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
const signer = new RawSigner(keypair, provider);
const address = await signer.getAddress();

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';
const devUSDT = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdt::DEVNET_USDT';

// This example shows how to swap BTC to USDC and then swap back to BTC
(async () => {
  const sourceCoinAmount = 0.01;
  const [quote1] = await fetchQuotes({
    sourceCoin: devBTC,
    targetCoin: devUSDC,
    sourceCoinAmount,
  });
  const [quote2] = await fetchQuotes({
    sourceCoin: devUSDC,
    targetCoin: devBTC,
    sourceCoinAmount: quote1.target_amount,
  });

  const btcInfo = findCoinByType(devBTC);
  const usdcInfo = findCoinByType(devUSDC);
  if (!btcInfo || !usdcInfo) throw new Error('Coin not found');

  const txb = new TransactionBlock();
  const owner = txb.pure(address);

  const btcBefore = await getSufficientCoinObjects({
    provider,
    owner: address,
    coinType: devBTC,
    requiredAmount: sourceCoinAmount * (10 ** btcInfo.decimals),
  });

  const usdc = umiAggregatorMoveCall({
    transactionBlock: txb,
    quote: quote1,
    accountAddress: owner,
    coins: btcBefore.map(coin => txb.object(coin.coinObjectId)),
  });

  const btcAfter = umiAggregatorMoveCall({
    transactionBlock: txb,
    quote: quote2,
    accountAddress: owner,
    coins: [usdc],
  });

  txb.transferObjects([btcAfter, usdc], owner);

  const dryRunResult = await signer.dryRunTransactionBlock({ transactionBlock: txb });
  console.log(dryRunResult.balanceChanges);
  // TODO: Check btc balance increase

  const result = await signer.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    options: {
      showBalanceChanges: true,
      showEffects: true,
    }
  });
  const gasUsed = result.effects && getTotalGasUsed(result.effects);
  console.log(result.digest, gasUsed);
})();
