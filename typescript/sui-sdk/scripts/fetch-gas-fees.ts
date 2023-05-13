import { Connection, JsonRpcProvider, getTotalGasUsed } from '@mysten/sui.js';

const provider = new JsonRpcProvider(
  new Connection({
    fullnode: 'https://fullnode.mainnet.sui.io',
  }),
);

const packageId = process.argv[2];

const blocks = await provider.queryTransactionBlocks({
  filter: {
    InputObject: packageId,
  },
  options: {
    showEffects: true,
  }
});

console.log(blocks.data.map(b => b.effects && getTotalGasUsed(b.effects)));
