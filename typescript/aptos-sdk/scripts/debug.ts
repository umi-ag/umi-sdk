import { AptosAccount, AptosClient, } from 'aptos';
import fs from 'fs';
import type { SwapSettings, TradingRoute } from '../src';
import { buildTransactionPayloadForUmiAgSwap } from '../src';

const NODE_URL = 'https://fullnode.mainnet.aptoslabs.com';

const client = new AptosClient(NODE_URL);

const privateKey0x = process.env.APTOS_PRIVATE_KEY as string;
const privateKey = privateKey0x.replace(/^0x/, '');
const privateKeyU8 = Uint8Array.from(Buffer.from(privateKey, 'hex'));
const account = new AptosAccount(privateKeyU8);
const address = account.address().toString();

const d = await client.getAccount(address);

// const quote = await fetchQuoteFromUmi({
//   sourceCoin: '0x1::aptos_coin::AptosCoin',
//   targetCoin: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
//   sourceAmount: 1000,
//   venueAllowList: ['anime'],
// });

const data = fs.readFileSync('scripts/routing.json', 'utf8');
const quote: TradingRoute = JSON.parse(data);

const swapSettings: SwapSettings = {
  maxGasFee: 40_000,
  slippageTolerance: 1,
  transactionDeadline: 30,
};

// const r = makeSwapPayload(quote, swapSettings);
const r = buildTransactionPayloadForUmiAgSwap({ quote, swapSettings });

if (r.isErr()) {
  console.log(r.error);
  process.exit(1);
}

// const excuteuTradeTransactionForAptos = async () => {
//   const payload = makeSwapPayload(quote, initialSwapSettings);
//   console.log({ payload });
//   if (payload.isErr()) return;
//   const res = await ResultAsync
//     .fromPromise(client.signAndSubmitTransaction(
//       { type: 'entry_function_payload', ...payload, },
//       initialSwapSettings
//     ), (e) => e as any);
//   return res;
// };

// const payload = await buildTransactionPayloadForUmiAgSwap({quote, initialSwapSettings});

const payload = r.value;
// const builder = new TransactionBuilderRemoteABI(client, { sender: account.address() });
// const rawTx = await builder.build(payload.function, payload.type_arguments, payload.arguments);
const rawTx = await client.generateTransaction(address, payload);

const txResult = await client.simulateTransaction(account, rawTx);
// const txResult = await client.signAndSubmitTransaction(account, rawTx);

console.log(txResult);
