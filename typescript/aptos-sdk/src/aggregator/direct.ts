import type { Types } from 'aptos';
import { ok } from 'neverthrow';
import { UMIAG_PACKAGE_ID } from '../config';
import { SwapSettings, TradingRoute } from '../types';
import { calcMinAmount } from './calculator';
import { getPoolType, getTypeArgs, getVenueType, is_x_to_y_ } from './helper';

const getTypeArgsFromQuote = (quote: TradingRoute) => {
  const typeArgs = getTypeArgs(quote.paths[0].path.steps[0].venues[0].venue, is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue));
  if (typeArgs.isErr()) return typeArgs;

  return ok(typeArgs.value);
};

const getArgsFromQuote = (quote: TradingRoute, settings: SwapSettings) => {
  const dexType = getVenueType(quote.paths[0].path.steps[0].venues[0].venue);
  if (dexType.isErr()) return dexType;

  const poolType = getPoolType(quote.paths[0].path.steps[0].venues[0].venue);

  const fromAmountStr = Math.round(quote.source_amount).toString();
  const minAmountStr = calcMinAmount(quote.target_amount, settings.slippageTolerance);

  return ok([
    dexType.value,
    poolType,
    is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue),
    fromAmountStr,
    minAmountStr,
  ]);
};

export const makeDirectSwapPayload = (
  quote: TradingRoute,
  settings: SwapSettings,
) => {
  const typeArgs = getTypeArgsFromQuote(quote);
  if (typeArgs.isErr()) return typeArgs;

  const args = getArgsFromQuote(quote, settings);
  if (args.isErr()) return args;

  const payload: Types.TransactionPayload = {
    type: 'entry_function_payload',
    function: `${UMIAG_PACKAGE_ID}::one_step_route`,
    type_arguments: typeArgs.value,
    arguments: args.value,
  };

  return ok(payload);
};