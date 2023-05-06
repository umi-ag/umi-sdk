import {
  Connection,
  Ed25519Keypair,
  fromB64,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
} from '@mysten/sui.js';
import fetch from 'cross-fetch';
import {
  fetchQuotesFromUmi,
  moveCallUmiAgTradeExact,
  moveCallWithdrawCoin,
} from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: 'https://fullnode.mainnet.sui.io',
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

const SUI = '0x2::sui::SUI';
const WETHw = '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN';

// This example shows how to swap BTC to USDC and then swap back to BTC
(async () => {
  const sourceAmount = 1000; // u64

  const [quote1] = await fetchQuotesFromUmi({
    sourceCoin: SUI,
    targetCoin: WETHw,
    sourceAmount,
  });
  console.log(quote1);

  const txb = new TransactionBlock();
  const owner = txb.pure(address);

  const suiBefore = await moveCallWithdrawCoin({
    provider,
    owner: address,
    coinType: SUI,
    requiredAmount: sourceAmount,
    txb,
  });

  const eth = moveCallUmiAgTradeExact({
    transactionBlock: txb,
    quote: quote1,
    accountAddress: owner,
    coins: [suiBefore],
    minTargetAmount: txb.pure(0),
  });
  txb.transferObjects([eth], owner);

  // const btcAfter = moveCallUmiAgTradeExactSourceCoin({
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
