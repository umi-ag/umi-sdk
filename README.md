# @umi-ag/sui-sdk

The `@umi-ag/sui-sdk` is a TypeScript library that provides an easy-to-use interface for interacting with the Umi Aggregator on the Sui blockchain. It simplifies the process of fetching trading routes, creating transaction blocks, and executing trades through the Umi Aggregator.

## Features

- Fetch trading routes for a given query
- Create transaction blocks from trading routes
- Execute trading routes on the Sui blockchain through the Umi Aggregator

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
import { UmiSDK } from "@umi-ag/sui-sdk";

// Create an instance of UmiSDK
const umisdk = new UmiSDK({
  userAddress: "your-sui-address",
});

// Fetch trading routes
const query = {
  source_coin: "0x2::sui::SUI",
  destination_coin: "UMI",
  amount: "1000000000000000000", // 1 ETH in wei
};

// Create a transaction block from the best trading route at the time
const swapConfig = {
  slippageTolerance: 0.01, // 1% slippage tolerance
};
const transactionBlock = await umisdk.createTransactionBlockFromBestRoute(
  query,
  swapConfig,
);

// Execute the selected trading route 
await signAndExecuteTransactionBlock({
  transactionBlock,
});
```

## Documentation

For more information on how to use @umi-ag/sui-sdk-ts and its features, please refer to the [official documentation](https://sui-sdk-ts.example.com/docs).

## Contributing

We welcome contributions to @umi-ag/sui-sdk-ts! If you'd like to contribute, please follow our [contributing guidelines](https://sui-sdk-ts.example.com/contributing) and read our [code of conduct](https://sui-sdk-ts.example.com/code-of-conduct).

## License

@umi-ag/sui-sdk-ts is released under the [MIT License](LICENSE).
