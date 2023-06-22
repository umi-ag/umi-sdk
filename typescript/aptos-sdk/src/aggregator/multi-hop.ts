import type { Types } from 'aptos';
import { ok } from 'neverthrow';
import { UMIAG_PACKAGE_ID } from '../config';
import { SwapSettings, TradingRoute } from '../types';
import { calcMinAmount } from './calculator';
import { getPoolType, getTypeArgs, getVenueType, is_x_to_y_ } from './helper';

const makeTypeArgs2hop = (quote: TradingRoute) => {
  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[0].path.steps[1].venues[0].venue);

  const types1 = getTypeArgs(quote.paths[0].path.steps[0].venues[0].venue, is_x_to_y_1);
  if (types1.isErr()) return types1;
  const types2 = getTypeArgs(quote.paths[0].path.steps[1].venues[0].venue, is_x_to_y_2);
  if (types2.isErr()) return types2;

  const [X, Y, E1, _, Z, E2] = [...types1.value, ...types2.value];

  return ok([X, Y, Z, E1, E2]);
};

const makeTypeArgs3hop = (quote: TradingRoute) => {
  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[0].path.steps[1].venues[0].venue);
  const is_x_to_y_3 = is_x_to_y_(quote.paths[0].path.steps[2].venues[0].venue);

  const types1 = getTypeArgs(quote.paths[0].path.steps[0].venues[0].venue, is_x_to_y_1);
  if (types1.isErr()) return types1;
  const types2 = getTypeArgs(quote.paths[0].path.steps[1].venues[0].venue, is_x_to_y_2);
  if (types2.isErr()) return types2;
  const types3 = getTypeArgs(quote.paths[0].path.steps[2].venues[0].venue, is_x_to_y_3);
  if (types3.isErr()) return types3;

  const [X, Y, E1, _z, Z, E2, _w, W, E3] = [...types1.value, ...types2.value, ...types3.value];

  return ok([X, Y, Z, W, E1, E2, E3]);
};

const makeArgs2hop = (quote: TradingRoute, settings: SwapSettings) => {
  const dexType1 = getVenueType(quote.paths[0].path.steps[0].venues[0].venue);
  if (dexType1.isErr()) return dexType1;
  const dexType2 = getVenueType(quote.paths[0].path.steps[1].venues[0].venue);
  if (dexType2.isErr()) return dexType2;

  const poolType1 = getPoolType(quote.paths[0].path.steps[0].venues[0].venue);
  const poolType2 = getPoolType(quote.paths[0].path.steps[1].venues[0].venue);

  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[0].path.steps[1].venues[0].venue);

  const fromAmountStr = Math.round(quote.source_amount).toString();
  const minToAmountStr = calcMinAmount(quote.target_amount, settings.slippageTolerance);

  return ok([
    dexType1.value,
    poolType1,
    is_x_to_y_1,
    dexType2.value,
    poolType2,
    is_x_to_y_2,
    fromAmountStr,
    minToAmountStr,
  ]);
};

const makeArgs3hop = (quote: TradingRoute, settings: SwapSettings) => {
  const dexType1 = getVenueType(quote.paths[0].path.steps[0].venues[0].venue);
  if (dexType1.isErr()) return dexType1;
  const dexType2 = getVenueType(quote.paths[0].path.steps[1].venues[0].venue);
  if (dexType2.isErr()) return dexType2;
  const dexType3 = getVenueType(quote.paths[0].path.steps[2].venues[0].venue);
  if (dexType3.isErr()) return dexType3;

  const poolType1 = getPoolType(quote.paths[0].path.steps[0].venues[0].venue);
  const poolType2 = getPoolType(quote.paths[0].path.steps[1].venues[0].venue);
  const poolType3 = getPoolType(quote.paths[0].path.steps[2].venues[0].venue);

  const is_x_to_y_1 = is_x_to_y_(quote.paths[0].path.steps[0].venues[0].venue);
  const is_x_to_y_2 = is_x_to_y_(quote.paths[0].path.steps[1].venues[0].venue);
  const is_x_to_y_3 = is_x_to_y_(quote.paths[0].path.steps[2].venues[0].venue);

  const fromAmountStr = Math.round(quote.source_amount).toString();
  const minToAmountStr = calcMinAmount(quote.target_amount, settings.slippageTolerance);

  return ok([
    dexType1.value,
    poolType1,
    is_x_to_y_1,
    dexType2.value,
    poolType2,
    is_x_to_y_2,
    dexType3.value,
    poolType3,
    is_x_to_y_3,
    fromAmountStr,
    minToAmountStr,
  ]);
};

export const make2HopSwapPayload = (quote: TradingRoute, settings: SwapSettings) => {
  const typeArgs = makeTypeArgs2hop(quote);
  if (typeArgs.isErr()) return typeArgs;

  const args = makeArgs2hop(quote, settings);
  if (args.isErr()) return args;

  const payload: Types.TransactionPayload = {
    type: 'entry_function_payload',
    function: `${UMIAG_PACKAGE_ID}::aggregator::::two_step_route`,
    type_arguments: typeArgs.value,
    arguments: args.value,
  };

  return ok(payload);
};

export const make3HopSwapPayload = (quote: TradingRoute, settings: SwapSettings) => {
  const typeArgs = makeTypeArgs3hop(quote);
  if (typeArgs.isErr()) return typeArgs;

  const args = makeArgs3hop(quote, settings);
  if (args.isErr()) return args;

  const payload: Types.TransactionPayload = {
    type: 'entry_function_payload',
    function: `${UMIAG_PACKAGE_ID}::aggregator::three_step_route`,
    type_arguments: typeArgs.value,
    arguments: args.value,
  };

  return ok(payload);
};
