import type { JsonRpcProvider, SuiAddress } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';
import { fetchQuotes } from '../api';
import { getSufficientCoinObjects } from '../utils';
import { umiAggregatorMoveCall } from './umiAggregatorMoveCall';
import Decimal from 'decimal.js';
import type { TradingRoute } from '../types';

type BuildTransactionBlockWithQuoteArgs = {
  provider: JsonRpcProvider,
  quote: TradingRoute,
  accountAddress: SuiAddress,
  slippageTolerance: number,
};

export const buildUmiAggregatorTxbWithQuote = async ({
  provider,
  quote,
  accountAddress,
  slippageTolerance,
}: BuildTransactionBlockWithQuoteArgs) => {
  const txb = new TransactionBlock();

  const sourceCoins = await getSufficientCoinObjects({
    provider,
    owner: accountAddress,
    coinType: quote.source_coin,
    requiredAmount: quote.source_amount,
  });

  const sourceCoinObjects = sourceCoins.map(coin => txb.object(coin.coinObjectId));

  const accountAddressObject = txb.pure(accountAddress);

  const minTargetCoinAmount = new Decimal(quote.target_amount)
    .ceil() // TODO: remove this
    .mul(1 - slippageTolerance)
    .round()
    .toString();

  const targetCoinObject = umiAggregatorMoveCall({
    transactionBlock: txb,
    quote,
    accountAddress: accountAddressObject,
    coins: sourceCoinObjects,
    minTargetCoinAmount: txb.pure(minTargetCoinAmount),
  });

  txb.transferObjects([targetCoinObject], accountAddressObject);

  return txb;
};

type BuildTransactionBlockWithBestQuoteArgs = {
  provider: JsonRpcProvider,
  sourceCoinType: string,
  targetCoinType: string,
  sourceCoinAmount: bigint,
  accountAddress: SuiAddress,
  slippageTolerance: number,
};

export const buildUmiAggregatorTxbWithBestQuote = async ({
  provider,
  sourceCoinType,
  targetCoinType,
  sourceCoinAmount,
  accountAddress,
  slippageTolerance,
}: BuildTransactionBlockWithBestQuoteArgs) => {
  // TODO: Compare all quotes and pick the best one.
  const [quote] = await fetchQuotes({
    sourceCoin: sourceCoinType,
    targetCoin: targetCoinType,
    sourceCoinAmount: sourceCoinAmount.toString(),
  });

  const txb = await buildUmiAggregatorTxbWithQuote({
    provider,
    quote,
    accountAddress,
    slippageTolerance,
  });

  return txb;
};
