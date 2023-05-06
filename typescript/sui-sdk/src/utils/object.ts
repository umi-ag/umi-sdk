import type { TransactionBlock } from '@mysten/sui.js';

export const maybeFindOrCreateObjectRef = (
  txb: TransactionBlock,
  objectId: string,
) => {
  // If the venue object is already in the transaction block, use it.
  const venueObjectArg =
    txb.blockData.inputs.find(e => e.value === objectId)
    ?? txb.pure(objectId);

  return venueObjectArg;
};
