import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock, } from '@mysten/sui.js';
import fetch from 'cross-fetch';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(new Connection({
  fullnode: 'https://sui-api.rpcpool.com',
}));

const mnemonic = process.env.SUI_MNEMONIC as string;
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
// console.log(keypair.getPublicKey().toSuiAddress());
const signer = new RawSigner(keypair, provider);

/**
    route
      chain
coina--step---coinb--step----coinc
     | venue         venue  |
     | venue         venue  |
     |                      |
     |chain                 |
     --step---coinc----------
       venue
       venue
*/
(async () => {
  const txb = new TransactionBlock();
  // const packageId = '0x565ad69a232eb915c9f7570701e4d69c078df8b3c673994a52c47703467e0bb9';
  // const moduleName = 'scripts';
  // const functionName = 'two_hop_xy_umaswap_udoswap_script';
  // const firstVenue = '0x86b3949bccb7285620ac3264721a7c4b756aff94189c1ce4f870b73475a8c5c9';
  // const secondVenue = '0x971ab08fe8c56d2fe5e9a314dcad406117a695956d68b6efcfab9cceb3ddc5f2';

  const udoSwanFn = '0xf0e20b74b25ff952e9dc906b53bea2a5f33fd33f7d2fc56c754df96f9c66f30c::dex::swap_x_to_y_direct';
  const umaSwanFn = '0x61eea51ba7688c8d05e45e13bcbfdd36450832d58ac5d061b046a1df5d489807::dex::swap_x_to_y_direct';

  const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
  const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';
  const devUSDT = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdt::DEVNET_USDT';

  const udoVenue = '0xb15cd58ef08a7d6f8f846c0e113b9eb10be5a56eb5d2c7c072b8b8cd786f62e1';
  const umaVenue = '0x86b3949bccb7285620ac3264721a7c4b756aff94189c1ce4f870b73475a8c5c9';

  // const owner = '0x1af1728adfd0286249259b3e5bcc0ce573a10ac7e5dd114fae7133f56f367e02';
  const owner = await signer.getAddress();

  const [btc] = (await provider.getCoins({ owner, coinType: devBTC }))
    .data;

  const [btc1, btc2] = txb.splitCoins(
    txb.object(btc.coinObjectId),
    [txb.pure(1000), txb.pure(2000)],
  );

  const usdc1 = txb.moveCall({
    target: udoSwanFn,
    typeArguments: [devBTC, devUSDC],
    arguments: [
      txb.pure(udoVenue),
      btc1,
      // txb.makeMoveVec({ objects: coins.map(coin => txb.object(coin.coinObjectId)) }),
      // txb.makeMoveVec({ objects: [] }),
      // txb.pure(1000),
      // txb.pure(1000),
    ],
  });

  const usdc2 = txb.moveCall({
    target: umaSwanFn,
    typeArguments: [devBTC, devUSDC],
    arguments: [
      txb.pure(umaVenue),
      btc2,
    ],
  });

  txb.mergeCoins(usdc1, [usdc2]);

  txb.transferObjects([usdc1], txb.pure(owner));
  console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));

  // const result = await signer.signAndExecuteTransactionBlock({
  //   transactionBlock: txb,
  //   options: {
  //     showBalanceChanges: true,
  //     showObjectChanges: true,
  //     showEffects: true,
  //     showEvents: true,
  //     showInput: true,
  //   },
  // });
  // console.log(JSON.stringify(result, null, 2));
})();
