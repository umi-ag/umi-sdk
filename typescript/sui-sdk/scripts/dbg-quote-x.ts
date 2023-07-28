import fetch from 'cross-fetch';
import { buildTransactionBlockForUmiAgSwap, fetchQuoteX } from '../src';
import { address, printTxb, provider, signer } from './common';

globalThis.fetch = fetch;

const LOT_SIZE = 1e8;
const SOURCE_AMOUNT = LOT_SIZE * 50; // 5 SUI

const [quoteX] = await fetchQuoteX({ endpoint: 'http://localhost:8080' });
// console.log(quoteX);

quoteX.source_amount = SOURCE_AMOUNT;

const txb = await buildTransactionBlockForUmiAgSwap({
  quote: quoteX,
  accountAddress: address,
  provider: provider,
  slippageTolerance: 1
});

printTxb(txb);
const r = await signer.dryRunTransactionBlock({ transactionBlock: txb });
console.log(JSON.stringify(r, null, 2));

// const r = await signer.signAndExecuteTransactionBlock({ transactionBlock: txb });
// console.log(r.digest);
