import type { TradingRoute, VenueName } from '../types';

// check if a venue is in a trading route
export const isVenueInTradingRoute = (name: VenueName, tradingRoute: TradingRoute) => {
  const { paths } = tradingRoute;

  return paths
    .some(({ path }) => path.steps
      .some(({ venues }) => venues
        .some(({ venue }) => venue.name === name)));
};
