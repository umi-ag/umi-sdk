// import type { SignerWithProvider, SuiAddress } from '@mysten/sui.js';
// import { JsonRpcProvider, testnetConnection } from '@mysten/sui.js';
// import { fetchQuotes } from './api';
// import { createTradeTransactionBlockFromRoute } from './core/createTransactionBlock';
// import { getSufficientCoinObjects } from './utils/coins';
// import type { QuoteQuery, SwapConfig, TradingRoute, UmiSdkArg } from './types';

export * from './api';
export * from './types';
export * from './utils';
export * from './core';

// const defaultProvider = new JsonRpcProvider(testnetConnection);

// export class UmiSDK {
//   private provider: JsonRpcProvider;
//   private userAddress: SuiAddress;
//   private signer?: SignerWithProvider;

//   /**
//    * Initialize UmiSDK with signer, provider, and user address
//    * @param args - The arguments to initialize UmiSDK
//    */
//   constructor({
//     signer,
//     provider,
//     userAddress,
//   }: UmiSdkArg) {
//     this.provider = provider ?? signer?.provider ?? defaultProvider;
//     this.signer = signer;
//     this.userAddress = userAddress;
//   }

//   /**
//    * Fetch trading routes for the given query
//    * @param query - The query to fetch trading routes
//    * @returns A promise that resolves to an array of trading routes
//    */
//   public async fetchTradingRoutes(query: QuoteQuery) {
//     const routes = await fetchQuotes(query);
//     if (routes.length === 0) {
//       throw new Error('No trading routes found');
//     }

//     return routes;
//   }

//   /**
//    * Create a transaction block from the given trading route and swap configuration
//    * @param route - The trading route to create a transaction block
//    * @param swapConfig - The configuration for the swap, including slippage tolerance and other settings
//    * @returns A promise that resolves to a transaction block
//    */
//   public async createTransactionBlockFromRoute(route: TradingRoute, swapConfig: SwapConfig) {
//     const coinsResult = await getSufficientCoinObjects(
//       this.provider,
//       this.userAddress,
//       route.source_coin,
//       route.source_amount,
//     );

//     if (coinsResult.isErr()) {
//       throw new Error(`Failed to get sufficient coin objects: ${coinsResult.error}`);
//     }

//     const txbResult = createTradeTransactionBlockFromRoute(
//       this.userAddress,
//       route,
//       coinsResult.value,
//       swapConfig,
//     );
//     if (txbResult.isErr()) {
//       throw new Error(`Failed to create trade transaction block: ${txbResult.error}`);
//     }

//     return txbResult.value;
//   }

//   /**
//    * Create a transaction block from the best trading route found for the given query and swap configuration
//    * @param query - The query to fetch trading routes
//    * @param swapConfig - The swap configuration, including slippage tolerance
//    * @returns A promise that resolves to a transaction block created from the best trading route
//    */
//   public async createTransactionBlockFromBestRoute(query: QuoteQuery, swapConfig: SwapConfig) {
//     const [bestRoute] = await this.fetchTradingRoutes(query);

//     const txb = this.createTransactionBlockFromRoute(bestRoute, swapConfig);

//     return txb;
//   }

//   /**
//    * Execute the given trading route with the specified swap configuration
//    * @param route - The trading route to execute
//    * @param swapConfig - The configuration for the swap, including slippage tolerance and other settings
//    * @returns A promise that resolves to a transaction receipt
//    */
//   public async executeRoute(route: TradingRoute, swapConfig: SwapConfig) {
//     if (!this.signer) {
//       throw new Error('A signer is required to call executeRoute method');
//     }

//     const txb = await this.createTransactionBlockFromRoute(route, swapConfig);

//     return this.signer.signAndExecuteTransactionBlock({
//       transactionBlock: txb,
//     });
//   }
// }

// export {
//   fetchQuotes as fetchRoutes,
//   createTradeTransactionBlockFromRoute,
// };
