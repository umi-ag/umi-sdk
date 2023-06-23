import { err } from 'neverthrow';
import { makeDirectSwapPayload } from '../aggregator/direct';
import { make2HopSwapPayload, make3HopSwapPayload } from '../aggregator/multi-hop';
import { make2SplitSwapPayload, make3SplitSwapPayload } from '../aggregator/split';
import type { SwapSettings, TradingRoute } from '../types';

export type BuildTransactionPayloadForUmiAgSwapArgs = {
  quote: TradingRoute,
  setting: SwapSettings,
};

export function buildTransactionPayloadForUmiAgSwap(args: BuildTransactionPayloadForUmiAgSwapArgs) {

  if (args.quote.swap_type === 'direct') {
    return makeDirectSwapPayload(args.quote, args.setting);
  } else if (args.quote.swap_type === 'split') {
    if (args.quote.paths.length === 3) {
      return make3SplitSwapPayload(args.quote, args.setting);
    } else {
      return make2SplitSwapPayload(args.quote, args.setting);
    }
  } else if (args.quote.swap_type === 'multi-hop') {
    if (args.quote.paths[0].path.steps.length === 3) {
      return make3HopSwapPayload(args.quote, args.setting);
    } else if (args.quote.paths[0].path.steps.length === 2) {
      return make2HopSwapPayload(args.quote, args.setting);
    }
  }

  return err(`Invalid arguments: ${args.quote.swap_type}`);
  // throw new Error('Not implemented');
}

export type FetchQuoteFromBuildTransactionPayloadForUmiAgSwapArgs = {
};

export async function fetchQuoteFromBuildTransactionPayloadForUmiAgSwap(args: FetchQuoteFromBuildTransactionPayloadForUmiAgSwapArgs): any {
  throw new Error('Not implemented');
}
