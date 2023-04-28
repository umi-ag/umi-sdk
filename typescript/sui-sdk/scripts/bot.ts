import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock, getTotalGasUsed } from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { fetchQuotes, getSufficientCoinObjects, aggregateMoveCall } from '../src';
import { findCoinByType } from '@umi-ag/sui-coin-list';
import Decimal from 'decimal.js';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(new Connection({
  fullnode: 'https://sui-api.rpcpool.com',
}));

const mnemonic = process.env.SUI_MNEMONIC as string;
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
const signer = new RawSigner(keypair, provider);
const owner = await signer.getAddress();

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';
const devUSDT = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdt::DEVNET_USDT';

(async () => {
  const sourceCoinAmount = 0.0001;
  const [quote] = await fetchQuotes({
    sourceCoin: devBTC,
    // targetCoin: devBTC,
    targetCoin: devUSDC,
    sourceCoinAmount,
  });

  const sourceCoinInfo = findCoinByType(devBTC);

  const sourceCoins = await getSufficientCoinObjects({
    provider,
    owner,
    coinType: devBTC,
    requiredAmount: sourceCoinAmount ** (sourceCoinInfo?.decimals ?? 1),
  });
  console.log(sourceCoins);

  const txb = new TransactionBlock();

  const targetCoin = aggregateMoveCall({
    transactionBlock: txb,
    quote,
    accountAddress: txb.pure(owner),
    coins: sourceCoins.map(coin => txb.object(coin.coinObjectId)),
    // minTargetCoinAmount: txb.pure('10'),
  });

  txb.transferObjects([targetCoin], txb.pure(owner));
  console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));

  const dryRunResult = await signer.dryRunTransactionBlock({ transactionBlock: txb });
  console.log(JSON.stringify(dryRunResult, null, 2));

  const gasUsed = getTotalGasUsed(dryRunResult.effects);
  const suiMarketPrice = 1;

  const pnl = new Decimal(quote.target_amount)
    .minus(quote.source_amount)
    .minus(gasUsed?.toString() ?? 0);

  if (pnl.gt(0)) {
    await signer.signAndExecuteTransactionBlock({
      transactionBlock: txb,
    });

    console.log(`Profit: ${pnl.toString()} ${quote.target_coin}`);
  }
})();
