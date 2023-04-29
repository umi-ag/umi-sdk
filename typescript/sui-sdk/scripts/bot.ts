import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { getSufficientCoinObjects, umiAggregatorMoveCall, dev_fetchSplitQuotes } from '../src';
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

(async () => {
  const sourceCoinAmount = 0.01;
  const [quote1] = await dev_fetchSplitQuotes({
    sourceCoin: devBTC,
    targetCoin: devUSDC,
    sourceCoinAmount,
  });
  const [quote2] = await dev_fetchSplitQuotes({
    sourceCoin: devUSDC,
    targetCoin: devBTC,
    sourceCoinAmount: quote1.target_amount,
  });

  // console.log(JSON.stringify(quote1, null, 2));
  // console.log(JSON.stringify(quote2, null, 2));

  const btcInfo = findCoinByType(devBTC);
  const usdcInfo = findCoinByType(devUSDC);
  // console.log(btcInfo, usdcInfo);
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
  // txb.transferObjects([usdc], owner);

  const btcAfter = umiAggregatorMoveCall({
    transactionBlock: txb,
    quote: quote2,
    accountAddress: owner,
    coins: [usdc],
  });

  txb.transferObjects([btcAfter, usdc], owner);
  // console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));

  // const dryRunResult2 = await signer.dryRunTransactionBlock({ transactionBlock: txb });
  // console.log(JSON.stringify(dryRunResult2, null, 2));

  const result = await signer.signAndExecuteTransactionBlock({
    transactionBlock: txb,
  });
  // console.log(JSON.stringify(result, null, 2));
  console.log(result.digest);
  // const gasUsed = getTotalGasUsed(dryRunResult.effects);
  // const suiMarketPrice = 1;

  // const pnl = new Decimal(quote.target_amount)
  //   .minus(quote.source_amount)
  //   .minus(gasUsed?.toString() ?? 0);

  // if (pnl.gt(0)) {
  //   // await signer.signAndExecuteTransactionBlock({
  //   //   transactionBlock: txb,
  //   // });

  //   console.log(`Profit: ${pnl.toString()} ${quote.target_coin}`);
  // }
})();
