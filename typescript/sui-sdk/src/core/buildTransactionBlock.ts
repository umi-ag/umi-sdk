import type { JsonRpcProvider, SuiAddress } from '@mysten/sui.js';
import { TransactionBlock, getTotalGasUsed } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { fetchQuoteFromUmi } from '../api';
import { UMIAG_PACKAGE_ID } from '../config';
import type { TradingRoute } from '../types';
import { moveCallWithdrawCoin } from '../utils';
import { formatTypeName } from '../utils/type-name';
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

export type FetchTradingAmountListAndFeeArgs = {
  provider: JsonRpcProvider,
  transactionBlock: TransactionBlock,
  senderAddress: SuiAddress
};

export const fetchTradingAmountListAndFee = async ({
  provider,
  transactionBlock,
  senderAddress,
}: FetchTradingAmountListAndFeeArgs) => {
  const devInspectResult = await provider.devInspectTransactionBlock({
    transactionBlock,
    sender: senderAddress,
  });

  if (devInspectResult.error) {
    throw new Error(devInspectResult.error);
  }

  const networkFee = Number(getTotalGasUsed(devInspectResult.effects) ?? 0);

  const swapBeginEvent = devInspectResult
    .events
    .find((event) => event.type === `${UMIAG_PACKAGE_ID}::umi_aggregator::SwapBeginEvent`);
  const swapEndEvent = devInspectResult
    .events
    .find((event) => event.type === `${UMIAG_PACKAGE_ID}::umi_aggregator::SwapEndEvent`);

  if (!swapBeginEvent || !swapEndEvent) {
    throw new Error('Required events not found');
  }

  const tradingAmountList = [
    {
      coinType: formatTypeName(swapBeginEvent.parsedJson?.coin_type.name),
      amount: -Number(swapBeginEvent.parsedJson?.amount), // minus because it's a withdraw
    },
    {
      coinType: formatTypeName(swapEndEvent.parsedJson?.coin_type.name),
      amount: Number(swapEndEvent.parsedJson?.amount),
    },
  ];

  return {
    tradingAmountList,
    networkFee,
  };
};
