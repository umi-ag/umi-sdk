import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';

export type VectorRemoveMoveCallArgs = {
  txb: TransactionBlock,
  vectorType: string,
  vector: TransactionArgument,
  index: TransactionArgument,
};

export const vectorRemoveMoveCall = ({
  txb,
  vectorType,
  vector,
  index,
}: VectorRemoveMoveCallArgs) => {
  return txb.moveCall({
    target: '0x1::vector::remove',
    typeArguments: [vectorType],
    arguments: [vector, index],
  });
};
