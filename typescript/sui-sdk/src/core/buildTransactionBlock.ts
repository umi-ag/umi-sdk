import type { JsonRpcProvider, SuiAddress } from '@mysten/sui.js';
import { TransactionBlock, getTotalGasUsed } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { fetchQuoteFromUmi } from '../api';
import type { TradingRoute } from '../types';
import { moveCallWithdrawCoin } from '../utils';
import { moveCallUmiAgSwapExact } from './moveCallUmiAgSwap';

type BuildTransactionBlockForUmiAgSwapArgs = {
  provider: JsonRpcProvider,
  quote: TradingRoute,
  accountAddress: SuiAddress,
  slippageTolerance: number,
};

export const buildTransactionBlockForUmiAgSwap = async ({
  provider,
  quote,
  accountAddress,
  slippageTolerance,
}: BuildTransactionBlockForUmiAgSwapArgs) => {
  const txb = new TransactionBlock();

  const sourceCoin = await moveCallWithdrawCoin({
    provider,
    owner: accountAddress,
    coinType: quote.source_coin,
    requiredAmount: quote.source_amount,
    txb,
  });

  const accountAddressObject = txb.pure(accountAddress);

  const minTargetAmount = new Decimal(quote.target_amount)
    .floor() // TODO: remove this
    .mul(1 - slippageTolerance)
    .round()
    .toString();

  const targetCoinObject = moveCallUmiAgSwapExact({
    transactionBlock: txb,
    quote,
    accountAddress: accountAddressObject,
    coins: [sourceCoin],
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

export const fetchQuoteAndBuildTransactionBlockForUmiAgSwap = async ({
  provider,
  sourceCoinType,
  targetCoinType,
  sourceAmount,
  accountAddress,
  slippageTolerance,
}: FetchQuoteAndBuildTransactionBlockArgs) => {
  // TODO: Compare all quotes and pick the best one.
  const [quote] = await fetchQuoteFromUmi({
    sourceCoin: sourceCoinType,
    targetCoin: targetCoinType,
    sourceAmount: sourceAmount.toString(),
  });
  console.log(JSON.stringify(quote, null, 2));

  const txb = await buildTransactionBlockForUmiAgSwap({
    provider,
    quote,
    accountAddress,
    slippageTolerance,
  });

  return txb;
};

export type EstimateBalanceChangeArgs = {
  provider: JsonRpcProvider,
  transactionBlockBytes: string,
  // coinType: string,
};

export const estimateBalanceChange = async ({
  provider,
  transactionBlockBytes,
  // coinType,
}: EstimateBalanceChangeArgs) => {
  const dryRunResult = await provider.dryRunTransactionBlock({
    transactionBlock: transactionBlockBytes,
  });

  const gasUsed = Number((dryRunResult.effects && getTotalGasUsed(dryRunResult.effects)) ?? 0);

  const tradingAmountList = dryRunResult.balanceChanges.reduce((prev, cur) => {
    const amount = new Decimal(cur.amount);
    if (cur.coinType === '0x2::sui::SUI') {
      amount.add(gasUsed);
    }
    prev[cur.coinType] = amount.toNumber();
    return prev;
  }, {} as Record<string, number>);

  return {
    tradingAmountList,
    networkFee: gasUsed,
  };
};
