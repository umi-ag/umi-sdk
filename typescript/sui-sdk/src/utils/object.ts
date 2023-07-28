import type { JsonRpcProvider, TransactionBlock } from '@mysten/sui.js';

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

type FindObjectByTypeArgs = {
  txb: TransactionBlock;
  type: string;
  provider: JsonRpcProvider;
  owner: string;
};

export const findObjectByType = async ({
  txb,
  type,
  provider,
  owner
}: FindObjectByTypeArgs) => {
  const objects = await provider.getOwnedObjects({
    owner,
    options: {
      showType: true,
    }
  });

  const objectId = objects.data.find(e => e.data?.type === type)?.data?.objectId;
  if (!objectId) {
    return null;
  }

  return maybeFindOrCreateObjectRef(txb, objectId);
};
