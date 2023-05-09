import {
  Connection,
  Ed25519Keypair,
  fromB64,
  getTotalGasUsed,
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
const USDTw = '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN';
const USDCw = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';

// This example shows how to swap BTC to USDC and then swap back to BTC
(async () => {
  const sourceAmount = 2_000_000_000; // u64

  const [quote1] = await fetchQuotesFromUmi({
    sourceCoin: SUI,
    // targetCoin: WETHw,
    targetCoin: USDCw,
    sourceAmount,
  });
  console.log(JSON.stringify(quote1, null, 2));

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

  console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));
  const dryRunResult = await signer.dryRunTransactionBlock({
    transactionBlock: txb,
  });
  console.log(JSON.stringify(dryRunResult, null, 2));

  const gasUsed = dryRunResult.effects && getTotalGasUsed(dryRunResult.effects);
  console.log({ gasUsed });
  // console.log(dryRunResult.balanceChanges);
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
