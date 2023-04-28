import type { VenueBook } from '../types';

export const packageBook = {
  sui_aggregator: {
    packageObjectId: '0x565ad69a232eb915c9f7570701e4d69c078df8b3c673994a52c47703467e0bb9',
    modules: {
      aggregator: 'aggregator',
      scripts: 'scripts',
    }
  },
  udoswap: {
    packageObjectId: '0xcf5728450cc8a2a6b328bee8505c088011414cf0',
    dex: {
      name: 'dex',
      create_pool: 'create_pool',
      add_liquidity: 'add_liquidity',
    }
  },
  umaswap: {
    packageObjectId: '0xf1b482548468e45b79eccb2dd1096b51191f55ef',
    dex: {
      name: 'dex',
      create_pool: 'create_pool',
      add_liquidity: 'add_liquidity',
    }
  },
};

export const venueObjectIdBook: VenueBook = {
  udoswap: {
    BTC_USDC: {
      venueObjectId: '0xb15cd58ef08a7d6f8f846c0e113b9eb10be5a56eb5d2c7c072b8b8cd786f62e1',
      coinXType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC',
      coinYType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC',
    },
    USDT_USDC: {
      venueObjectId: '0x971ab08fe8c56d2fe5e9a314dcad406117a695956d68b6efcfab9cceb3ddc5f2',
      coinXType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC',
      coinYType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdt::DEVNET_USDT',
    },
    ETH_USDC: {
      venueObjectId: '0xb33f0c3e0c4ae9d9191a59cb68cfd63ed64a914a2e895c96b72665d3fa6782ac',
      coinXType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_eth::DEVNET_ETH',
      coinYType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC',
    }
  },
  umaswap: {
    BTC_USDC: {
      venueObjectId: '0x86b3949bccb7285620ac3264721a7c4b756aff94189c1ce4f870b73475a8c5c9',
      coinXType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC',
      coinYType: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC',
    },
  },
};

export const findVenueInfo = (objectId: string) => {
  return Object.entries(venueObjectIdBook)
    .flatMap(([protocolName, venues]) => Object.values(venues)
      .map(venue => ({ protocolName, ...venue })))
    .find(venue => venue.venueObjectId === objectId);
};
