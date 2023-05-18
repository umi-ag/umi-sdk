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
  fetchQuoteFromUmi,
  moveCallUmiAgSwapExact,
  moveCallWithdrawCoin,
} from '../src';

globalThis.fetch = fetch;

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: 'https://fullnode.mainnet.sui.io',
  })
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

const SUI = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
const WETHw =
  '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN';
const USDTw =
  '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN';
const USDCw =
  '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
const SSWP =
  '0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc::TOKEN::TOKEN';
const SOURCE_AMOUNT = 100_000;
const SLIPPAGE_TOLERANCE = 0.01; // 1%

// This example shows how to swap BTC to USDC and then swap back to BTC
(async () => {
  const sourceAmount = SOURCE_AMOUNT; // u64

  const [quote1] = await fetchQuoteFromUmi({
    sourceCoin: SUI,
    targetCoin: USDCw,
    sourceAmount,
    venueAllowList: ['interestswap'],
  });
  console.log(JSON.stringify(quote1, null, 2));

  const txb = new TransactionBlock();
  const owner = txb.pure(address);

  const sourceBefore = await moveCallWithdrawCoin({
    provider,
    owner: address,
    coinType: SUI,
    requiredAmount: sourceAmount,
    txb,
  });

  const minTargetAmount = Math.floor(
    quote1.target_amount * (1 - SLIPPAGE_TOLERANCE)
  );

  const targetOutputCoin = moveCallUmiAgSwapExact({
    transactionBlock: txb,
    quote: quote1,
    accountAddress: owner,
    coins: [sourceBefore],
    minTargetAmount: txb.pure(minTargetAmount),
  });
  txb.transferObjects([targetOutputCoin], owner);

  // const btcAfter = moveCallUmiAgSwapExactSourceCoin({
  //   transactionBlock: txb,
  //   quote: quote2,
  //   accountAddress: owner,
  //   coins: [usdc],
  // });

  // txb.transferObjects([btcAfter, usdc], owner);

  {
    console.log(JSON.stringify(JSON.parse(txb.serialize()), null, 2));
    const dryRunResult = await signer.dryRunTransactionBlock({
      transactionBlock: txb,
    });
    console.log(JSON.stringify(dryRunResult, null, 2));

    const gasUsed =
      dryRunResult.effects && getTotalGasUsed(dryRunResult.effects);
    console.log({ gasUsed });
    // console.log(dryRunResult.balanceChanges);
    // Check BTC balance increase ...
  }

  {
    const result = await signer.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      options: {
        showBalanceChanges: true,
        showEffects: true,
      },
    });
    const gasUsed = result.effects && getTotalGasUsed(result.effects);
    console.log(result.digest, gasUsed);
  }
})();
