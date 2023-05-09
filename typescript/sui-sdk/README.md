# @umi-ag/sui-sdk

The `@umi-ag/sui-sdk` is a TypeScript library that provides an easy-to-use
interface for interacting with the Umi Aggregator on the Sui blockchain. It
simplifies the process of fetching trading routes, creating transaction blocks,
and executing trades through the Umi Aggregator.

## Features

- Fetch trading routes for a given query
- Create transaction blocks from trading routes
- Execute trading routes on the Sui Blockchain through the Umi Aggregator

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
import { fetchQuoteAndBuildTransactionBlockForUmiAgSwap } from "@umi-ag/sui-sdk";

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: "https://fullnode.mainnet.sui.io",
  }),
);

const keypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string;
  const privatekey = privatekey0x.replace(/^0x/, "");
  const privateKeyBase64 = Buffer.from(privatekey, "hex").toString("base64");
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));
};
const signer = new RawSigner(keypair(), provider);
const address = await signer.getAddress();

const SUI = "0x2::sui::SUI";
const USDCw =
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";

const txb = await fetchQuoteAndBuildTransactionBlockForUmiAgSwap({
  provider,
  accountAddress: address,
  sourceCoinType: SUI,
  targetCoinType: USDCw,
  sourceAmount: 1000n,
  slippageTolerance: 0.01, // 1%
});

await signer.signAndExecuteTransactionBlock({ transactionBlock: txb });
```

Additionally, you can manually add move calls to the TransactionBlock.

```typescript
import {
  fetchQuotesFromUmi,
  moveCallUmiAgSwapExact,
  moveCallWithdrawCoin,
} from "@umi-ag/sui-sdk";

const sourceAmount = 1000; // u64
const [quote] = await fetchQuotesFromUmi({
  sourceCoin: devBTC,
  targetCoin: devUSDC,
  sourceAmount,
});

const txb = new TransactionBlock();
const owner = txb.pure(address);

const btc = await moveCallWithdrawCoin({
  provider,
  owner: address,
  coinType: devBTC,
  requiredAmount: sourceAmount,
  txb,
});

const usdc = moveCallUmiAgSwapExact({
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
