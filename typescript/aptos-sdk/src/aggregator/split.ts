import type { Types } from 'aptos';
import { ok } from 'neverthrow';
import { UMIAG_PACKAGE_ID } from '../config';
import type { SwapSettings, TradingRoute } from '../types';
import { calcMinAmount } from './calculator';
import { getPoolType, getTypeArgs, getVenueType, is_x_to_y_ } from './helper';

const get2SplitTypeArgsFromQuote = (quote: TradingRoute) => {
  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[1].path.steps[0].venues[0].venue);

  const types1 = getTypeArgs(quote.paths[0].path.steps[0].venues[0].venue, is_x_to_y_1);
  if (types1.isErr()) return types1;
  const types2 = getTypeArgs(quote.paths[1].path.steps[0].venues[0].venue, is_x_to_y_2);
  if (types2.isErr()) return types2;

  const [X, Y, E1] = types1.value;
  const [_, __, E2] = types2.value;

  return ok([X, Y, E1, E2]);
};

const get3SplitTypeArgsFromQuote = (quote: TradingRoute) => {
  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[1].path.steps[0].venues[0].venue);
  const is_x_to_y_3 = is_x_to_y_(quote.paths[2].path.steps[0].venues[0].venue);

  const types1 = getTypeArgs(quote.paths[0].path.steps[0].venues[0].venue, is_x_to_y_1);
  if (types1.isErr()) return types1;
  const types2 = getTypeArgs(quote.paths[1].path.steps[0].venues[0].venue, is_x_to_y_2);
  if (types2.isErr()) return types2;
  const types3 = getTypeArgs(quote.paths[2].path.steps[0].venues[0].venue, is_x_to_y_3);
  if (types3.isErr()) return types3;

  const [X, Y, E1] = types1.value;
  const [_2, __2, E2] = types2.value;
  const [_3, __3, E3] = types3.value;

  return ok([X, Y, E1, E2, E3]);
};

const get2SplitArgsFromQuote = (quote: TradingRoute, settings: SwapSettings) => {
  const dexType1 = getVenueType(quote.paths[0].path.steps[0].venues[0].venue);
  if (dexType1.isErr()) return dexType1;
  const dexType2 = getVenueType(quote.paths[1].path.steps[0].venues[0].venue);
  if (dexType2.isErr()) return dexType2;

  const poolType1 = getPoolType(quote.paths[0].path.steps[0].venues[0].venue);
  const poolType2 = getPoolType(quote.paths[1].path.steps[0].venues[0].venue);

  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[1].path.steps[0].venues[0].venue);

  const firstPart = (quote.paths[0].weight * 1e3).toString(); // permille

  const fromAmountStr = Math.round(quote.source_amount).toString();
  const minToAmountStr = calcMinAmount(quote.target_amount, settings.slippageTolerance);

  return ok([
    dexType1.value,
    poolType1,
    is_x_to_y_1,
    firstPart,
    dexType2.value,
    poolType2,
    is_x_to_y_2,
    fromAmountStr,
    minToAmountStr,
  ]);
};

const get3SplitArgsFromQuote = (quote: TradingRoute, settings: SwapSettings) => {
  const dexType1 = getVenueType(quote.paths[0].path.steps[0].venues[0].venue);
  if (dexType1.isErr()) return dexType1;
  const dexType2 = getVenueType(quote.paths[1].path.steps[0].venues[0].venue);
  if (dexType2.isErr()) return dexType2;
  const dexType3 = getVenueType(quote.paths[2].path.steps[0].venues[0].venue);
  if (dexType3.isErr()) return dexType3;

  const poolType1 = getPoolType(quote.paths[0].path.steps[0].venues[0].venue);
  const poolType2 = getPoolType(quote.paths[1].path.steps[0].venues[0].venue);
  const poolType3 = getPoolType(quote.paths[2].path.steps[0].venues[0].venue);

  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[1].path.steps[0].venues[0].venue);
  const is_x_to_y_3 = is_x_to_y_(quote.paths[2].path.steps[0].venues[0].venue);

  const firstPart = (quote.paths[0].weight * 1e3).toString(); // permille
  const secondPart = (quote.paths[1].weight * 1e3).toString(); // permille

  const fromAmountStr = Math.round(quote.source_amount).toString();
  const minToAmountStr = calcMinAmount(quote.target_amount, settings.slippageTolerance);

  return ok([
    dexType1.value,
    poolType1,
    is_x_to_y_1,
    firstPart,
    dexType2.value,
    poolType2,
    is_x_to_y_2,
    secondPart,
    dexType3.value,
    poolType3,
    is_x_to_y_3,
    fromAmountStr,
    minToAmountStr,
  ]);
};

export const make2SplitSwapPayload = (quote: TradingRoute, settings: SwapSettings) => {
  const typeArgs = get2SplitTypeArgsFromQuote(quote);
  if (typeArgs.isErr()) return typeArgs;

  const args = get2SplitArgsFromQuote(quote, settings);
  if (args.isErr()) return args;

  const payload: Types.TransactionPayload = {
    type: 'entry_function_payload',
    function: `${UMIAG_PACKAGE_ID}::aggregator::two_split_route`,
    // function: `${protocolBook.hippo.modules().aggregator}::two_split_route`,
    type_arguments: typeArgs.value,
    arguments: args.value,
  };

  return ok(payload);
};

export const make3SplitSwapPayload = (quote: TradingRoute, settings: SwapSettings) => {
  const typeArgs = get3SplitTypeArgsFromQuote(quote);
  if (typeArgs.isErr()) return typeArgs;

  const args = get3SplitArgsFromQuote(quote, settings);
  if (args.isErr()) return args;

  const payload: Types.TransactionPayload = {
    type: 'entry_function_payload',
    function: `${UMIAG_PACKAGE_ID}::aggregator::three_split_route`,
    type_arguments: typeArgs.value,
    arguments: args.value,
  };

  return ok(payload);
};
