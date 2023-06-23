export * from './helper';

import { err } from 'neverthrow';
import type { SwapSettings, TradingRoute } from '../types';
import { makeDirectSwapPayload } from './direct';
import { make2HopSwapPayload, make3HopSwapPayload } from './multi-hop';
import { make2SplitSwapPayload, make3SplitSwapPayload } from './split';

export const makeSwapPayload = (quote: TradingRoute, settings: SwapSettings) => {
  if (quote.swap_type === 'direct') {
    return makeDirectSwapPayload(quote, settings);
  } else if (quote.swap_type === 'split') {
    if (quote.paths.length === 3) {
      return make3SplitSwapPayload(quote, settings);
    } else {
      return make2SplitSwapPayload(quote, settings);
    }
  } else if (quote.swap_type === 'multi-hop') {
    if (quote.paths[0].path.steps.length === 3) {
      return make3HopSwapPayload(quote, settings);
    } else if (quote.paths[0].path.steps.length === 2) {
      return make2HopSwapPayload(quote, settings);
    }
  }

  return err(`Invalid arguments: ${quote.swap_type}`);
};
