import type { JsonRpcProvider, TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { umiTradePackageId } from '../config';
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

export type MoveCallWithdrawCoinsArgs = GetSufficientCoinsArgs & {
  txb: TransactionBlock,
};

export const moveCallWithdrawCoin = async ({ txb, ...args }: MoveCallWithdrawCoinsArgs) => {
  const coins = await getSufficientCoins(args);
  const coin = moveCallMergeCoins({
    txb,
    coinType: args.coinType,
    coins: coins.map(c => txb.pure(c.coinObjectId)),
  });

  const splited = txb.splitCoins(coin, [txb.pure(args.requiredAmount)]);
  moveCallMaybeTransferOrDestroyCoin({
    txb,
    coinType: args.coinType,
    coin,
  });
  return splited;
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
  return txb.moveCall({
    target: `${umiTradePackageId}::utils::merge_coins`,
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
    target: `${umiTradePackageId}::utils::maybe_transfer_or_destroy_coin`,
    typeArguments: [coinType],
    arguments: [coin],
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
    target: `${umiTradePackageId}::utils::check_amount_sufficient`,
    typeArguments: [coinType],
    arguments: [coin, amount],
  });
};

// export type SplitCoinByWeightsArgs = {
//   txb: TransactionBlock,
//   coinType: string,
//   coins: TransactionArgument[],
//   weights: TransactionArgument[],
// };

// export const splitCoinByWeights = ({
//   txb,
//   coinType,
//   coins,
//   weights,
// }: SplitCoinByWeightsArgs) => {
//   // const a = txb.makeMoveVec({ objects: coins });
//   // const b = txb.makeMoveVec({ objects: weights });

//   const result = txb.moveCall({
//     target: '0x69aac48222cdd1d9e67cbb36406b7dbaa144ab4d021280d9ef9ea5e584b6a65e::utils::split_coin_by_weights',
//     typeArguments: [coinType],
//     arguments: [
//       // coins,
//       // weights,
//       txb.makeMoveVec({ objects: coins }),
//       txb.makeMoveVec({ objects: weights }),
//       // a, b
//     ],
//   });
//   // console.log(a, b);
//   console.log(coins, weights);

//   return result;

//   // return [...new Array(weights.length).keys()]
//   //   .map(() => moveCallVectorRemove({
//   //     txb,
//   //     vectorType: `0x2::coin::Coin<${coinType}>`,
//   //     vector: result,
//   //     index: txb.pure(0),
//   //   }));
// };

