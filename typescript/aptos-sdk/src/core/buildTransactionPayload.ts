import { ResultAsync, err } from 'neverthrow';
import { makeDirectSwapPayload } from '../aggregator/direct';
import { make2HopSwapPayload, make3HopSwapPayload } from '../aggregator/multi-hop';
import { make2SplitSwapPayload, make3SplitSwapPayload } from '../aggregator/split';
import { fetchQuoteFromUmi } from '../api';
import type { QuoteQuery, SwapSettings, TradingRoute } from '../types';

export type BuildTransactionPayloadForUmiAgSwapArgs = {
  quote: TradingRoute,
  swapSettings: SwapSettings,
};

export function buildTransactionPayloadForUmiAgSwap({
  quote,
  swapSettings,
}: BuildTransactionPayloadForUmiAgSwapArgs) {
  if (quote.swap_type === 'direct') {
    return makeDirectSwapPayload(quote, swapSettings);
  } else if (quote.swap_type === 'split') {
    if (quote.paths.length === 3) {
      return make3SplitSwapPayload(quote, swapSettings);
    } else {
      return make2SplitSwapPayload(quote, swapSettings);
    }
  } else if (quote.swap_type === 'multi-hop') {
    if (quote.paths[0].path.steps.length === 3) {
      return make3HopSwapPayload(quote, swapSettings);
    } else if (quote.paths[0].path.steps.length === 2) {
      return make2HopSwapPayload(quote, swapSettings);
    }
  }

  return err(`Invalid arguments: ${quote.swap_type}`);
}

export type FetchQuoteFromBuildTransactionPayloadForUmiAgSwapArgs = {
  quoteQuery: QuoteQuery,
  swapSettings: SwapSettings,
};

export async function fetchQuoteFromBuildTransactionPayloadForUmiAgSwap({
  quoteQuery,
  swapSettings,
}: FetchQuoteFromBuildTransactionPayloadForUmiAgSwapArgs) {
  const fetchResult = await ResultAsync.fromPromise(fetchQuoteFromUmi(quoteQuery), e => e);
  if (fetchResult.isErr()) return fetchResult;

  const [quote] = fetchResult.value;
  const r = buildTransactionPayloadForUmiAgSwap({ quote, swapSettings: swapSettings });

  return r;
}
