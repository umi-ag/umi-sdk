import type { JsonRpcProvider, TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { UMIAG_PACKAGE_ID } from '../config';
import type { CoinObject } from '../types';
import { moveCallVectorDestroyEmpty, moveCallVectorRemove } from './vector';

type GetSufficientCoinsArgs = {
  provider: JsonRpcProvider,
  owner: string,
  coinType: string,
  requiredAmount: number | string,
};

export const getSufficientCoins = async ({
  provider,
  owner,
  coinType,
  requiredAmount,
}: GetSufficientCoinsArgs) => {
  const coins: CoinObject[] = [];
  const totalBalance = () => coins.reduce((sub, cur) => sub.plus(cur.balance), new Decimal(0));

  let cursor;
  let hasNextPage = true;
  while (totalBalance().lt(requiredAmount) && hasNextPage) {
    const page = (await provider.getCoins({ owner, coinType, cursor }));
    cursor = page.nextCursor;
    hasNextPage = page.hasNextPage;
    coins.push(...page.data);
  }

  if (totalBalance().lt(requiredAmount)) {
    // return err('Insufficient coin objects available for the signer to meet the required amount.');
    throw new Error('Insufficient coin objects available for the signer to meet the required amount.');
  }

  // return ok(coins);
  return coins;
};

export type MoveCallWithdrawCoinsArgs = GetSufficientCoinsArgs & {
  txb: TransactionBlock,
};

export const moveCallWithdrawCoin = async ({ txb, ...args }: MoveCallWithdrawCoinsArgs) => {
  if (args.coinType === '0x2::sui::SUI') {
    return txb.splitCoins(txb.gas, [txb.pure(args.requiredAmount)]);
  }

  const coins = await getSufficientCoins(args);

  return moveCallMaybeSplitCoinsAndTransferRest({
    txb,
    coinType: args.coinType,
    coins: coins.map(c => txb.pure(c.coinObjectId)),
    amount: txb.pure(args.requiredAmount),
    recipient: txb.pure(args.owner),
  });
};

export const moveCallCoinZero = (
  txb: TransactionBlock,
  coinType: string,
) => {
  return txb.moveCall({
    target: '0x2::coin::zero',
    typeArguments: [coinType],
  });
};

export type MoveCallCoinValue = {
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
};

export const moveCallCoinValue = ({
  txb,
  coinType,
  coin,
}: MoveCallCoinValue) => {
  return txb.moveCall({
    target: '0x2::coin::value',
    typeArguments: [coinType],
    arguments: [coin],
  });
};

export const addIntoBalanceCall = (
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
) => {
  return txb.moveCall({
    target: '0x2::coin::into_balance',
    typeArguments: [coinType],
    arguments: [coin],
  });
};

export type MoveCallMergeCoinsArgs = {
  txb: TransactionBlock,
  coinType: string,
  coins: TransactionArgument[],
};

export const moveCallMergeCoins = ({
  txb,
  coinType,
  coins,
}: MoveCallMergeCoinsArgs) => {
  if (coins.length === 1) {
    return coins[0];
  }

  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::utils::merge_coins`,
    typeArguments: [coinType],
    arguments: [txb.makeMoveVec({ objects: coins })],
  });
};

export type MoveCallMaybeTransferOrDestroyCoinArgs = {
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
};

export const moveCallMaybeTransferOrDestroyCoin = ({
  txb,
  coinType,
  coin,
}: MoveCallMaybeTransferOrDestroyCoinArgs) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::utils::maybe_transfer_or_destroy_coin`,
    typeArguments: [coinType],
    arguments: [coin],
  });
};

export type MoveCallMaybeSplitCoinAndTransferRest = {
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
  amount: TransactionArgument,
  recipient: TransactionArgument,
};

export const moveCallMaybeSplitCoinAndTransferRest = ({
  txb,
  coinType,
  coin,
  amount,
  recipient,
}: MoveCallMaybeSplitCoinAndTransferRest) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::utils::maybe_split_coin_and_transfer_rest`,
    typeArguments: [coinType],
    arguments: [coin, amount, recipient],
  });
};

export type MoveCallMaybeSplitCoinsAndTransferRest = {
  txb: TransactionBlock,
  coinType: string,
  coins: TransactionArgument[],
  amount: TransactionArgument,
  recipient: TransactionArgument,
};

export const moveCallMaybeSplitCoinsAndTransferRest = ({
  txb,
  coinType,
  coins,
  amount,
  recipient,
}: MoveCallMaybeSplitCoinsAndTransferRest) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::utils::maybe_split_coins_and_transfer_rest`,
    typeArguments: [coinType],
    arguments: [txb.makeMoveVec({ objects: coins }), amount, recipient],
  });
};

export type MoveCallCheckAmountSufficientArgs = {
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
  amount: TransactionArgument,
};

export const moveCallCheckAmountSufficient = ({
  txb,
  coinType,
  coin,
  amount,
}: MoveCallCheckAmountSufficientArgs) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::utils::check_amount_sufficient`,
    typeArguments: [coinType],
    arguments: [coin, amount],
  });
};

export type MoveCallSplitCoinByWeightsArgs = {
  txb: TransactionBlock,
  coinType: string,
  coins: TransactionArgument[],
  weights: number[],
};

export const moveCallSplitCoinByWeights = ({
  txb,
  coinType,
  coins,
  weights,
}: MoveCallSplitCoinByWeightsArgs) => {
  if (weights.length === 1 && coins.length === 1) {
    return coins;
  }

  const result = txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::utils::split_coin_by_weights`,
    typeArguments: [coinType],
    arguments: [
      txb.makeMoveVec({ objects: coins }),
      txb.pure(weights, 'vector<u64>'),
    ],
  });

  const vectorType = `0x2::coin::Coin<${coinType}>`;
  const splited = [...new Array(weights.length)].map(() => moveCallVectorRemove({
    txb,
    vectorType,
    vector: result,
    index: txb.pure(0),
  }));

  moveCallVectorDestroyEmpty({
    txb,
    vectorType,
    vector: result,
  });

  return splited;
};

export type MoveCallCalcQuantityArgs = {
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
  lotSize: number,
};

export const moveCallCalcQuantity = ({
  txb,
  coinType,
  coin,
  lotSize,
}: MoveCallCalcQuantityArgs) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::utils::calc_quantity`,
    typeArguments: [coinType],
    arguments: [coin, txb.pure(lotSize)],
  });
};
