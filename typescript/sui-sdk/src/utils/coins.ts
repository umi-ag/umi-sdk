import type { JsonRpcProvider, TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import type { CoinObject } from '../types';

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

export type MaybeTransferOrDestroyCoinArgs = {
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
};

export const maybeTransferOrDestroyCoin = ({
  txb,
  coinType,
  coin,
}: MaybeTransferOrDestroyCoinArgs) => {
  return txb.moveCall({
    target: '0x69aac48222cdd1d9e67cbb36406b7dbaa144ab4d021280d9ef9ea5e584b6a65e::utils::maybe_transfer_or_destroy_coin',
    typeArguments: [coinType],
    arguments: [coin],
  });
};

export type SplitCoinByWeightsArgs = {
  txb: TransactionBlock,
  coinType: string,
  coins: TransactionArgument[],
  weights: TransactionArgument[],
};

export const splitCoinByWeights = ({
  txb,
  coinType,
  coins,
  weights,
}: SplitCoinByWeightsArgs) => {
  return txb.moveCall({
    target: '0x69aac48222cdd1d9e67cbb36406b7dbaa144ab4d021280d9ef9ea5e584b6a65e::utils::split_coin_by_weights',
    typeArguments: [coinType],
    arguments: [
      txb.makeMoveVec({ objects: coins }),
      txb.makeMoveVec({ objects: weights }),
    ],
  });
};

export type CheckAmountSufficientArgs = {
  txb: TransactionBlock,
  coinType: string,
  coin: TransactionArgument,
  amount: TransactionArgument,
};

export const checkAmountSufficient = ({
  txb,
  coinType,
  coin,
  amount,
}: CheckAmountSufficientArgs) => {
  return txb.moveCall({
    target: '0x69aac48222cdd1d9e67cbb36406b7dbaa144ab4d021280d9ef9ea5e584b6a65e::utils::check_amount_sufficient',
    typeArguments: [coinType],
    arguments: [coin, amount],
  });
};
