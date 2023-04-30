# @umi-ag/sui-sdk

The `@umi-ag/sui-sdk` is a TypeScript library that provides an easy-to-use
interface for interacting with the Umi Aggregator on the Sui blockhop. It
simplifies the process of fetching trading routes, creating transaction blocks,
and executing trades through the Umi Aggregator.

## Features

- Fetch trading routes for a given query
- Create transaction blocks from trading routes
- Execute trading routes on the Sui blockhop through the Umi Aggregator

## Installation

Use npm or yarn to install @umi-ag/sui-sdk in your project:

```
npm install @umi-ag/sui-sdk
```

or

```
yarn add @umi-ag/sui-sdk
```

## Usage

Here's a simple example of how to use @umi-ag/sui-sdk:

```typescript
import { buildUmiAggregatorTxbWithBestQuote } from "@umi-ag/sui-sdk";

const provider = new JsonRpcProvider(testnetConnection);

const mnemonic = process.env.SUI_MNEMONIC as string;
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
const signer = new RawSigner(keypair, provider);
const accountAddress = await signer.getAddress();

const devBTC =
  "0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC";
const devUSDC =
  "0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC";

const txb = await buildUmiAggregatorTxbWithBestQuote({
  provider,
  accountAddress,
  sourceCoinType: devBTC,
  targetCoinType: devUSDC,
  sourceAmount: 1000n,
  slippageTolerance: 0.01, // 1%
});

await signer.signAndExecuteTransactionBlock({ transactionBlock: txb });
```

Additionally, you can manually add move calls to the TransactionBlock.

```typescript
import {
  fetchQuotes,
  getSufficientCoinObjects,
  umiAggregatorMoveCall,
} from "@umi-ag/sui-sdk";

const sourceAmount = 1000; // u64
const [quote1] = await fetchQuotes({
  sourceCoin: devBTC,
  targetCoin: devUSDC,
  sourceAmount,
});
const [quote2] = await fetchQuotes({
  sourceCoin: devUSDC,
  targetCoin: devBTC,
  sourceAmount: quote1.target_amount,
});

const txb = new TransactionBlock();
const owner = txb.pure(address);

const btcBefore = await getSufficientCoinObjects({
  provider,
  owner: address,
  coinType: devBTC,
  requiredAmount: sourceAmount,
});

const usdc = umiAggregatorMoveCall({
  transactionBlock: txb,
  quote: quote1,
  accountAddress: owner,
  coins: btcBefore.map((coin) => txb.object(coin.coinObjectId)),
});

const btcAfter = umiAggregatorMoveCall({
  transactionBlock: txb,
  quote: quote2,
  accountAddress: owner,
  coins: [usdc],
});

txb.transferObjects([btcAfter, usdc], owner);

const dryRunResult = await signer.dryRunTransactionBlock({
  transactionBlock: txb,
});
console.log(dryRunResult.balanceChanges);
// Check BTC balance increase ...

const result = await signer.signAndExecuteTransactionBlock({
  transactionBlock: txb,
  options: {
    showBalanceChanges: true,
    showEffects: true,
  },
});
```

See
[bot.ts](https://github.com/umi-ag/umi-sdk/typescript/sui-sdk/scripts/bot.ts)

## Documentation

For more information on how to use @umi-ag/sui-sdk and its features, please
refer to the [official documentation](https://docs.umi.ag).

## Contributing

We welcome contributions to @umi-ag/sui-sdk! If you'd like to contribute, please
follow our
[contributing guidelines](https://sui-sdk-ts.example.com/contributing) and read
our [code of conduct](https://sui-sdk-ts.example.com/code-of-conduct).

## License

@umi-ag/sui-sdk is released under the [MIT License](LICENSE).
