import { fetchQuoteFromUmi } from '../src';

const [quote] = await fetchQuoteFromUmi({
  sourceCoin: '0x2::sui::SUI',
  targetCoin:
    '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
  sourceAmount: 100 * 10 ** 9,
})
console.log(JSON.stringify(quote))
