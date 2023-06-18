import { AptosAccount, AptosClient } from 'aptos';
import { buildTransactionPayloadForUmiAgSwap, fetchQuoteFromUmi } from '../src';

const NODE_URL = 'https://fullnode.mainnet.aptoslabs.com';

const client = new AptosClient(NODE_URL);

const privateKey0x = process.env.APTOS_PRIVATE_KEY as string;
const privateKey = privateKey0x.replace(/^0x/, '');
const privateKeyU8 = Uint8Array.from(Buffer.from(privateKey, 'hex'));
const account = new AptosAccount(privateKeyU8);
const address = account.address().toString();

const d = await client.getAccount(address);

const quote = await fetchQuoteFromUmi({
  sourceCoin: '',
  targetCoin: '',
  sourceAmount: 1000,
});

const payload = await buildTransactionPayloadForUmiAgSwap({});

const r = await client.signAndSubmitTransaction(account, payload);

console.log(r);
