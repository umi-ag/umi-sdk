import type { Types } from 'aptos';
import type { U64 } from 'aptos/src/generated';
import { err, ok } from 'neverthrow';
import { Venue } from '../types';
import { VenueType } from '../venues';

export const getLiquidswapTypeArgs = (venue: Venue, x2y: boolean) => {
  const X = venue.source_coin;
  const Y = venue.target_coin;
  const E = pool.extensions.curveType;

  if (x2y) return [X, Y, E];
  return [Y, X, E];
};

export const getAptoswapnetTypeArgs = (venue: Venue, x2y: boolean) => {
  const X = venue.source_coin;
  const Y = venue.target_coin;

  if (x2y) return [X, Y, 'u8'];
  return [Y, X, 'u8'];
};

export const getAnimeSwapTypeArgs = (venue: Venue, x2y: boolean) => {
  const X = venue.source_coin;
  const Y = venue.target_coin;

  if (x2y) return [X, Y, 'u8'];
  return [Y, X, 'u8'];
};

export const getAuxTypeArgs = (venue: Venue, x2y: boolean) => {
  const X = venue.source_coin;
  const Y = venue.target_coin;

  if (x2y) return [X, Y, 'u8'];
  return [Y, X, 'u8'];
};

export const getCetusTypeArgs = (venue: Venue, x2y: boolean) => {
  const X = venue.source_coin;
  const Y = venue.target_coin;

  if (x2y) return [X, Y, 'u8'];
  return [Y, X, 'u8'];
};

export const getPancakeTypeArgs = (venue: Venue, x2y: boolean) => {
  const X = venue.source_coin;
  const Y = venue.target_coin;

  if (x2y) return [X, Y, 'u8'];
  return [Y, X, 'u8'];
};

const unsupportedDexErr = (venueName: string) => err(`Unsupported dex: ${venueName}`);

export const getPoolType = (venue: Venue): U64 => {
  return '0';
};

export const getTypeArgs = (venue: Venue, x2y: boolean) => {
  if (venue.name === 'anime') {
    return ok(getAnimeSwapTypeArgs(venue, x2y));
  }

  if (venue.name === 'aptoswapnet') {
    return ok(getAptoswapnetTypeArgs(venue, x2y));
  }

  if (venue.name === 'aux') {
    return ok(getAuxTypeArgs(venue, x2y));
  }

  if (venue.name === 'cetus') {
    return ok(getCetusTypeArgs(venue, x2y));
  }

  if (venue.name === 'pancake') {
    return ok(getPancakeTypeArgs(venue, x2y));
  }

  if (venue.name === 'pontem') {
    return ok(getLiquidswapTypeArgs(venue, x2y));
  }

  return unsupportedDexErr(venue.name);
};

export const getVenueType = (venue: Venue) => {
  if (venue.name === 'anime') {
    return ok(VenueType.Anime);
  }

  if (venue.name === 'aptoswapnet') {
    return ok(VenueType.Aptoswap);
  }

  if (venue.name === 'aux') {
    return ok(VenueType.Aux);
  }

  if (venue.name === 'cetus') {
    return ok(VenueType.Cetus);
  }

  if (venue.name === 'pancake') {
    return ok(VenueType.Pancake);
  }

  if (venue.name === 'pontem') {
    return ok(VenueType.Pontem.toString());
  }

  return unsupportedDexErr(venue.name);
};

export const getTypeArgsFromStructTag = (structTagString: Types.MoveStructTag) => {
  return structTagString.split('<')[1].split('>')[0].split(', ');
};

export const is_x_to_y_ = (venue: Venue) => {
  return venue.source_coin === getTypeArgsFromStructTag(venue.resource_type)[0];
};



