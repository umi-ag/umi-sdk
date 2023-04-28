# @umi-ag/sui-sdk-ts

The `@umi-ag/sui-sdk-ts` is a TypeScript library that provides an easy-to-use interface for interacting with the Umi Aggregator on the Sui blockchain. It simplifies the process of fetching trading routes, creating transaction blocks, and executing trades through the Umi Aggregator.

## Features

- Fetch trading routes for a given query
- Create transaction blocks from trading routes
- Execute trading routes on the Sui blockchain through the Umi Aggregator

## Installation

Use npm or yarn to install @umi-ag/sui-sdk-ts in your project:

```
npm install @umi-ag/sui-sdk-ts
```

or

```
yarn add @umi-ag/sui-sdk-ts
```

## Usage

Here's a simple example of how to use @umi-ag/sui-sdk-ts:

```typescript
import { UmiSDK } from "@umi-ag/sui-sdk-ts";
import { JsonRpcProvider } from "@mysten/sui.js";

const provider = new JsonRpcProvider(new Connection({
  fullnode: 'https://your-json-rpc-url',
}));

// Create an instance of UmiSDK
const umisdk = new UmiSDK({
  provider,
  userAddress: "your-sui-address",
});

// Fetch trading routes
const query = {
  source_coin: "0x2::sui::SUI",
  destination_coin: "UMI",
  amount: "1000000000000000000", // 1 ETH in wei
};
const routes = await umisdk.fetchTradingRoutes(query);

// Select a trading route
const selectedRoute = routes[0];

// Create a transaction block from the selected trading route
const swapConfig = {
  slippageTolerance: 0.01, // 1% slippage tolerance
};
const transactionBlock = await umisdk.createTransactionBlockFromRoute(selectedRoute, swapConfig);

// Execute the selected trading route (requires a signer)
await umisdk.executeRoute(selectedRoute, swapConfig);
```

## Documentation

For more information on how to use @umi-ag/sui-sdk-ts and its features, please refer to the [official documentation](https://sui-sdk-ts.example.com/docs).

## Contributing

We welcome contributions to @umi-ag/sui-sdk-ts! If you'd like to contribute, please follow our [contributing guidelines](https://sui-sdk-ts.example.com/contributing) and read our [code of conduct](https://sui-sdk-ts.example.com/code-of-conduct).

## License

@umi-ag/sui-sdk-ts is released under the [MIT License](LICENSE).
