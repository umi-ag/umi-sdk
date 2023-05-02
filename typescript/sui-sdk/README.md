# @umi-ag/sui-sdk

The `@umi-ag/sui-sdk` is a TypeScript library that provides an easy-to-use
interface for interacting with the Umi Aggregator on the Sui blockchain. It
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

Give it a try for a minute.

```sh
git clone https://github.com/umi-ag/umi-sdk umi-sdk
cd $_
cd typescript/sui-sdk
npm i
export SUI_PRIVATE_KEY=0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
npm run vite-node examples/bot-testnet.ts
```

Here's a simple example of how to use @umi-ag/sui-sdk:

```typescript
import { fetchQuoteAndBuildTransactionBlockForUmiTrade } from "@umi-ag/sui-sdk";

const provider = new JsonRpcProvider(testnetConnection);

const mnemonic = process.env.SUI_MNEMONIC as string;
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
const signer = new RawSigner(keypair, provider);
const accountAddress = await signer.getAddress();

const devBTC =
  "0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC";
const devUSDC =
  "0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC";

const txb = await fetchQuoteAndBuildTransactionBlockForUmiTrade({
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
  fetchQuotesFromUmi,
  getSufficientCoinObjects,
  umiAggregatorMoveCall,
} from "@umi-ag/sui-sdk";

const sourceAmount = 1000; // u64
const [quote] = await fetchQuotesFromUmi({
  sourceCoin: devBTC,
  targetCoin: devUSDC,
  sourceAmount,
});

const txb = new TransactionBlock();
const owner = txb.pure(address);

const btc = await withdrawCoin({
  provider,
  owner: address,
  coinType: devBTC,
  requiredAmount: sourceAmount,
  txb,
});

const usdc = umiAggregatorMoveCall({
  transactionBlock: txb,
  quote,
  accountAddress: owner,
  coins: [btc],
  minTargetAmount: txb.pure(0),
});
txb.transferObjects([usdc], owner);

const result = await signer.signAndExecuteTransactionBlock({
  transactionBlock: txb,
  options: {
    showBalanceChanges: true,
    showEffects: true,
  },
});

const gasUsed = result.effects && getTotalGasUsed(result.effects);
console.log(result.digest, gasUsed);
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
