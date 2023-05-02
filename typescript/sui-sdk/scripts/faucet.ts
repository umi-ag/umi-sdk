
import type { RawSigner } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';
import { assert } from 'console';
import { findCoinByType } from './coinList';

export const buildFaucetTransactionBlock = (
  coinType: `${string}::${string}::${string}`,
  amount: string | number | bigint,
) => {
  const coinProfile = findCoinByType(coinType);
  if (!coinProfile) return null;

  const [packageId, moduleName] = coinType.split('::');
  const q = {
    // @ts-ignore
    function: `${packageId}::${moduleName}::mint` as `${string}::${string}::mint`,
    amount,
    // @ts-ignore
    treasuryCap: coinProfile.objects.TreasuryCap,
  };

  const txb = new TransactionBlock();
  txb.moveCall({
    target: q.function,
    typeArguments: [],
    arguments: [
      txb.pure(q.treasuryCap),
      txb.pure(q.amount),
    ],
  });

  return txb;
};

type FaucetArgs ={
  signer: RawSigner,
  coinType: `${string}::${string}::${string}`,
  amount: string | number | bigint,
};

export const faucet = async ({ signer, coinType, amount }: FaucetArgs) => {
  const txb = buildFaucetTransactionBlock(coinType, amount);
  if (!txb) {
    assert(false, 'Invalid coinType');
    return;
  }

  const result = await signer.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    options: {
      showInput: true,
      showEffects: true,
      showEvents: true,
    }
  });

  const network = 'testnet';
  const { digest } = result;
  const url = `https://explorer.sui.io/txblock/${digest}?network=${network}`;
  console.log(url);
};
