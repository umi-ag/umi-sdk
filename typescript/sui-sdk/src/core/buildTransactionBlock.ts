import type { JsonRpcProvider, SuiAddress } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { fetchQuotesFromUmi } from '../api';
import type { TradingRoute } from '../types';
import { getSufficientCoins } from '../utils';
import { moveCallUmiTradeExact } from './moveCallUmiTrade';

type BuildTransactionBlockForUmiTradeArgs = {
  provider: JsonRpcProvider,
  quote: TradingRoute,
  accountAddress: SuiAddress,
  slippageTolerance: number,
};

export const buildTransactionBlockForUmiTrade = async ({
  provider,
  quote,
  accountAddress,
  slippageTolerance,
}: BuildTransactionBlockForUmiTradeArgs) => {
  const txb = new TransactionBlock();

  const sourceCoins = await getSufficientCoins({
    provider,
    owner: accountAddress,
    coinType: quote.source_coin,
    requiredAmount: quote.source_amount,
  });

  const accountAddressObject = txb.pure(accountAddress);

  const minTargetAmount = new Decimal(quote.target_amount)
    .floor() // TODO: remove this
    .mul(1 - slippageTolerance)
    .round()
    .toString();

  const targetCoinObject = moveCallUmiTradeExact({
    transactionBlock: txb,
    quote,
    accountAddress: accountAddressObject,
    coins: sourceCoins.map(coin => txb.pure(coin.coinObjectId)),
    minTargetAmount: txb.pure(minTargetAmount),
  });

  txb.transferObjects([targetCoinObject], accountAddressObject);

  return txb;
};

type FetchQuoteAndBuildTransactionBlockArgs = {
  provider: JsonRpcProvider,
  sourceCoinType: string,
  targetCoinType: string,
  sourceAmount: bigint,
  accountAddress: SuiAddress,
  slippageTolerance: number,
};

export const fetchQuoteAndBuildTransactionBlockForUmiTrade = async ({
  provider,
  sourceCoinType,
  targetCoinType,
  sourceAmount,
  accountAddress,
  slippageTolerance,
}: FetchQuoteAndBuildTransactionBlockArgs) => {
  // TODO: Compare all quotes and pick the best one.
  const [quote] = await fetchQuotesFromUmi({
    sourceCoin: sourceCoinType,
    targetCoin: targetCoinType,
    sourceAmount: sourceAmount.toString(),
  });
  console.log(JSON.stringify(quote, null, 2));

  const txb = await buildTransactionBlockForUmiTrade({
    provider,
    quote,
    accountAddress,
    slippageTolerance,
  });

  return txb;
};
