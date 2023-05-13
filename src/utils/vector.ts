import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';

export type MoveCallVectorRemoveArgs = {
  txb: TransactionBlock,
  vectorType: string,
  vector: TransactionArgument,
  index: TransactionArgument,
};

export const moveCallVectorRemove = ({
  txb,
  vectorType,
  vector,
  index,
}: MoveCallVectorRemoveArgs) => {
  return txb.moveCall({
    target: '0x1::vector::remove',
    typeArguments: [vectorType],
    arguments: [vector, index],
  });
};

export type MoveCallVectorDestroyEmptyArgs = {
  txb: TransactionBlock,
  vectorType: string,
  vector: TransactionArgument,
};

export const moveCallVectorDestroyEmpty = ({
  txb,
  vectorType,
  vector,
}: MoveCallVectorDestroyEmptyArgs) => {
  return txb.moveCall({
    target: '0x1::vector::destroy_empty',
    typeArguments: [vectorType],
    arguments: [vector],
  });
};
