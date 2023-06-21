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
  sourceCoin: '0x1::aptos_coin::AptosCoin',
  targetCoin: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
  sourceAmount: 1000,
  venueAllowList: ['anime'],
});

const payload = await buildTransactionPayloadForUmiAgSwap({});

const r = await client.signAndSubmitTransaction(account, payload);

console.log(r);
