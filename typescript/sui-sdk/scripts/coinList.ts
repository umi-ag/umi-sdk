
export type HexString = string;

export type CoinProfile = {
  name: string
  symbol: string
  officialSymbol: string
  decimals: number
  logoURI: string
  type: string
  objects: {
    package: string
    module: string
    objectName: string
    TreasuryCap?: HexString
    CoinMetadata?: HexString
  }
  extensions: {
    binanceSymbol?: string
    coingeckoId?: string
    description?: string
    discord?: string
    facebook?: string
    instagram?: string
    medium?: string
    reddit?: string
    telegram?: string
    twitter?: string
    website?: string
    yahoofinaceSymbol?: string
  }
};

export const coinlist: CoinProfile[] = [
  {
    name: 'Sui',
    symbol: 'SUI',
    officialSymbol: 'Sui',
    decimals: 9,
    logoURI: 'https://cryptototem.com/wp-content/uploads/2022/08/SUI-logo.jpg',
    type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    objects: {
      package: '0x2',
      module: 'sui',
      objectName: 'SUI',
    },
    extensions: {
      website: 'https://sui.io',
      coingeckoId: 'sui',
    }
  },
  {
    name: 'devnet BTC',
    symbol: 'BTC',
    officialSymbol: 'BTC',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579',
    type: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_btc::DEVNET_BTC',
    objects: {
      package: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef',
      module: 'devnet_btc',
      objectName: 'DEVNET_BTC',
      'TreasuryCap': '0x0f4c8192e58a0331ac8730519078f16a284959d8a400bbc2583063c3141b6491',
      'CoinMetadata': '0xd6a918f4411064b6d5d4dbd906062858263a24cf7fbde28e9acbfb17a190f175',
    },
    extensions: {
      coingeckoId: 'bitcoin',
      yahoofinaceSymbol: 'BTC-USD',
    }
  },
  {
    name: 'devnet ETH',
    symbol: 'ETH',
    officialSymbol: 'ETH',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
    type: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_eth::DEVNET_ETH',
    objects: {
      package: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef',
      module: 'devnet_eth',
      objectName: 'DEVNET_ETH',
      'TreasuryCap': '0x87389ee5b1525ba0ad0000863015daa2fc06d2e00baa5f1ee91c04de4ffa0216',
      'CoinMetadata': '0xa43942eb432888f0f50a4ca1f4b6a3567bae0c7e822a4931c696842bf94c4176',
    },
    extensions: {
      coingeckoId: 'ethereum',
      yahoofinaceSymbol: 'ETH-USD',
    }
  },
  {
    name: 'devnet USDC',
    symbol: 'USDC',
    officialSymbol: 'USDC',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389',
    type: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdc::DEVNET_USDC',
    objects: {
      package: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef',
      module: 'devnet_usdc',
      objectName: 'DEVNET_USDC',
      'TreasuryCap': '0x732932f664f4b52685c35a38a5e8340b80b139c30282e165c07d92dbd0022aae',
      'CoinMetadata': '0xcfce9e08d5401ebfb19b2f40336445344f73380fa7b4d9c65e30a3115e450cf1',
    },
    extensions: {
      coingeckoId: 'usd-coin',
      yahoofinaceSymbol: 'USDT-USD',
    }
  },
  {
    name: 'devnet USDT',
    symbol: 'USDT',
    officialSymbol: 'USDT',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707',
    type: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef::devnet_usdt::DEVNET_USDT',
    objects: {
      package: '0xda50fbb5eeb573e9825117b45564fd83abcdb487b5746f37a4a7c368f34a71ef',
      module: 'devnet_usdt',
      objectName: 'DEVNET_USDT',
      'TreasuryCap': '0x2fe33b62da671224cf5a331e5188e107cb7844cc6c1a379b625bd27717978ea8',
      'CoinMetadata': '0xa36fbb3915906a8ee5731a84d7f4163083bd3140bcec95f4f811ebad2b54c628',
    },
    extensions: {
      coingeckoId: 'tether',
      yahoofinaceSymbol: 'USDT-USD',
    }
  },
];

export const findCoinByType = (
  coinType: `${string}::${string}::${string}`,
) => {
  return coinlist.find(coin => coin.type === coinType);
};
