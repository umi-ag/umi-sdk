# @umi-ag/aptos-sdk

The `@umi-ag/aptos-sdk` is a TypeScript library that provides an easy-to-use
interface for interacting with the Umi Aggregator on the Aptos blockchain. It
simplifies the process of fetching trading routes, creating transaction blocks,
and executing trades through the Umi Aggregator.

## Features

- Fetch trading routes for a given query
- Create transaction blocks from trading routes
- Execute trading routes on the Aptos Blockchain through the Umi Aggregator

## Installation

Use npm or yarn to install @umi-ag/aptos-sdk in your project:

```
npm install @umi-ag/aptos-sdk
```

or

```
yarn add @umi-ag/aptos-sdk
```

## Usage

Give it a try for a minute.

```sh
git clone https://github.com/umi-ag/umi-sdk umi-sdk
cd $_
cd typescript/aptos-sdk
npm i
export APTOS_PRIVATE_KEY=0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
npm run vite-node examples/bot-testnet.ts
```

Here's a simple example of how to use @umi-ag/aptos-sdk:

```typescript
import { AptosAccount, AptosClient, } from 'aptos';
import { makeSwapPayload, SwapSettings, TradingRoute } from '@umi-ag/aptos';

const NODE_URL = 'https://fullnode.mainnet.aptoslabs.com';

const client = new AptosClient(NODE_URL);

const privateKey0x = process.env.APTOS_PRIVATE_KEY as string;
const privateKey = privateKey0x.replace(/^0x/, '');
const privateKeyU8 = Uint8Array.from(Buffer.from(privateKey, 'hex'));
const account = new AptosAccount(privateKeyU8);
const address = account.address().toString();

const quote = await fetchQuoteFromUmi({
  sourceCoin: '0x1::aptos_coin::AptosCoin',
  targetCoin: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
  sourceAmount: 1000,
  venueAllowList: ['anime'],
});

const swapSettings: SwapSettings = {
  maxGasFee: 40_000,
  slippageTolerance: 0.01,
  transactionDeadline: 30,
};

// this function returns a Result<SwapPayload, Error>
const r = buildTransactionPayloadForUmiAgSwap({ quote, swapSettings });

if (r.isErr()) {
  console.log(r.error);
  process.exit(1);
}

const payload = r.value;
const rawTx = await client.generateTransaction(address, payload);
const txResult = await client.signAndSubmitTransaction(account, rawTx);

console.log(txResult);
```

<!-- See
[bot.ts](https://github.com/umi-ag/umi-sdk/typescript/aptos-sdk/scripts/bot.ts) -->

## Documentation

For more information on how to use @umi-ag/aptos-sdk and its features, please
refer to the [official documentation](https://docs.umi.ag).

## Contributing

We welcome contributions to @umi-ag/aptos-sdk! If you'd like to contribute, please
follow our
[contributing guidelines](https://aptos-sdk-ts.example.com/contributing) and read
our [code of conduct](https://aptos-sdk-ts.example.com/code-of-conduct).

## License

@umi-ag/aptos-sdk is released under the [MIT License](LICENSE).