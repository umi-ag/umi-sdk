import { Types } from 'aptos';
import { ok } from 'neverthrow';
import { UMIAG_PACKAGE_ID } from '../config';
import { SwapSettings, TradingRoute } from '../types';

export type BuildTransactionPayloadForUmiAgSwapArgs = {
  quote: TradingRoute,
  setting: SwapSettings,
};

export async function buildTransactionPayloadForUmiAgSwap(args: BuildTransactionPayloadForUmiAgSwapArgs): any {

  const payload : Types.TransactionPayload = {
    type: 'entry_function_payload',
    function: `${UMIAG_PACKAGE_ID}::one_step_route`,
    type_arguments: typeArgs.value,
    arguments: args.value,
  };

  return ok(payload);
  // throw new Error('Not implemented');
}

export type FetchQuoteFromBuildTransactionPayloadForUmiAgSwapArgs = {
};

export async function fetchQuoteFromBuildTransactionPayloadForUmiAgSwap(args: FetchQuoteFromBuildTransactionPayloadForUmiAgSwapArgs): any {
  throw new Error('Not implemented');
}
