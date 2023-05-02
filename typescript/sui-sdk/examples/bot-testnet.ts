import {
  Connection,
  Ed25519Keypair,
  fromB64,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
} from '@mysten/sui.js';
import fetch from 'cross-fetch';
import { faucet } from '../scripts/faucet';
import {
  fetchQuotesFromUmi,
  moveCallUmiTrade,
  moveCallWithdrawCoin,
} from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: 'https://sui-api.rpcpool.com',
  }),
);

const keypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string; // 0x.....
  const privatekey = privatekey0x.replace(/^0x/, ''); //slice used to remove the first 2 letter from the string and that's 0x
  const privateKeyBase64 = Buffer.from(privatekey, 'hex').toString('base64'); //convert hex to base64 string
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));

  // const mnemonic = process.env.SUI_MNEMONIC as string;
  // return Ed25519Keypair.deriveKeypair(mnemonic);
};
const signer = new RawSigner(keypair(), provider);
const address = await signer.getAddress();
console.log({ address });

const devBTC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC';
const devUSDC = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC';
const devUSDT = '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdt::DEVNET_USDT';

// This example shows how to swap BTC to USDC and then swap back to BTC
(async () => {
  const sourceAmount = 1000; // u64
  await faucet({ signer, coinType: devBTC, amount: sourceAmount });

  const [quote1] = await fetchQuotesFromUmi({
    sourceCoin: devBTC,
    targetCoin: devUSDC,
    sourceAmount,
  });
  console.log(quote1);
  // const [quote2] = await fetchQuotesFromUmi({
  //   sourceCoin: devUSDC,
  //   targetCoin: devBTC,
  //   sourceAmount: quote1.target_amount,
  // });

  const txb = new TransactionBlock();
  const owner = txb.pure(address);

  const btcBefore = await moveCallWithdrawCoin({
    provider,
    owner: address,
    coinType: devBTC,
    requiredAmount: sourceAmount,
    txb,
  });

  const usdc = moveCallUmiTrade({
    transactionBlock: txb,
    quote: quote1,
    accountAddress: owner,
    coins: [btcBefore],
    minTargetAmount: txb.pure(0),
  });
  txb.transferObjects([usdc], owner);

  // const btcAfter = moveCallUmiTrade({
  //   transactionBlock: txb,
  //   quote: quote2,
  //   accountAddress: owner,
  //   coins: [usdc],
  // });

  // txb.transferObjects([btcAfter, usdc], owner);

  const dryRunResult = await signer.dryRunTransactionBlock({
    transactionBlock: txb,
  });
  console.log(dryRunResult.balanceChanges);
  // Check BTC balance increase ...

  // const result = await signer.signAndExecuteTransactionBlock({
  //   transactionBlock: txb,
  //   options: {
  //     showBalanceChanges: true,
  //     showEffects: true,
  //   }
  // });
  // const gasUsed = result.effects && getTotalGasUsed(result.effects);
  // console.log(result.digest, gasUsed);
})();
