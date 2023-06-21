import { SwapSettings, TradingRoute } from '../types';

const getTypeArgsFromQuote = (quote: PriceQuote) => {
  const typeArgs = getTypeArgs(quote.swapRoute1.pool, is_x_to_y_(quote.swapRoute1));
  if (typeArgs.isErr()) return typeArgs;

  return ok(typeArgs.value);
};

const getArgsFromQuote = (quote: PriceQuote, settings: SwapSettings) => {
  const dexType = getDexType(quote.swapRoute1.pool);
  if (dexType.isErr()) return dexType;

  const poolType = getPoolType(quote.swapRoute1.pool);

  const fromAmountStr = quote.fromCoin.toU64;
  const minAmount = calcMinAmount(quote.toCoin, settings.slippageTolerance);
  const minAmountStr = minAmount.toU64;

  return ok([
    dexType.value,
    poolType,
    is_x_to_y_(quote.swapRoute1),
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
    function: `${protocolBook.umi.modules().aggregator}::one_step_route`,
    // function: `${protocolBook.hippo.modules?.()?.aggregator}::one_step_route`,
    type_arguments: typeArgs.value,
    arguments: args.value,
  };

  return ok(payload);
};