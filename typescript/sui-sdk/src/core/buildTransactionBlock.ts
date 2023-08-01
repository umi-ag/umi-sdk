import type { JsonRpcProvider, SuiAddress } from '@mysten/sui.js';
import { TransactionBlock, getTotalGasUsed } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { fetchQuoteFromUmi } from '../api';
import { UMIAG_PACKAGE_ID } from '../config';
import type { TradingRoute } from '../types';
import { findObjectByType, moveCallWithdrawCoin } from '../utils';
import { formatTypeName } from '../utils/type-name';
import { moveCallUmiAgSwapExact } from './moveCallUmiAgSwap';

type BuildTransactionBlockForUmiAgSwapArgs = {
  provider: JsonRpcProvider,
  quote: TradingRoute,
  accountAddress: SuiAddress,
  slippageTolerance: number,
  partnerPolicyObjectId?: string,
};

export const buildTransactionBlockForUmiAgSwap = async ({
  provider,
  quote,
  accountAddress,
  slippageTolerance,
  partnerPolicyObjectId,
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

  // TODO: Only fetch this if a trading route includes deepbook
  const accountCap = await findObjectByType({
    txb,
    type: '0xdee9::custodian_v2::AccountCap',
    owner: accountAddress,
    provider,
  });

  const partnerPolicy = partnerPolicyObjectId ? txb.pure(partnerPolicyObjectId) : undefined;

  const targetCoinObject = moveCallUmiAgSwapExact({
    transactionBlock: txb,
    quote,
    accountAddress: accountAddressObject,
    coins: [sourceCoin],
    minTargetAmount: txb.pure(minTargetAmount),
    accountCap,
    partnerPolicy,
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
  partnerPolicyObjectId?: string,
};

export const fetchQuoteAndBuildTransactionBlockForUmiAgSwap = async ({
  provider,
  sourceCoinType,
  targetCoinType,
  sourceAmount,
  accountAddress,
  slippageTolerance,
  partnerPolicyObjectId,
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
    partnerPolicyObjectId,
  });

  return txb;
};

// TODO: Rename TradingAmount to SwapAmount
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
  transactionBlock.setSender(senderAddress);
  const txbBytes = await transactionBlock.build({ provider });
  const dryRunResult = await provider.dryRunTransactionBlock({
    transactionBlock: txbBytes,
  });

  if (dryRunResult.effects.status.status !== 'success') {
    throw new Error('Failed to dry run transaction block');
  }

  const networkFee = Number(getTotalGasUsed(dryRunResult.effects) ?? 0);

  const swapBeginEvent = dryRunResult
    .events
    .find((event) => event.type === `${UMIAG_PACKAGE_ID}::umi_aggregator::SwapBeginEvent`);
  const swapEndEvent = dryRunResult
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

export type FetchTradingAmountFromQuoteArgs = {
  provider: JsonRpcProvider,
  quote: TradingRoute,
  accountAddress: SuiAddress,
};

export const fetchTradingAmountFromQuote = async ({
  provider,
  quote,
  accountAddress,
}: FetchTradingAmountFromQuoteArgs) => {
  const txb = await buildTransactionBlockForUmiAgSwap({
    provider,
    quote,
    accountAddress,
    slippageTolerance: 1,
  });

  const { tradingAmountList, networkFee } = await fetchTradingAmountListAndFee({
    provider,
    transactionBlock: txb,
    senderAddress: accountAddress,
  });

  return {
    tradingAmountList,
    networkFee,
  };
};
