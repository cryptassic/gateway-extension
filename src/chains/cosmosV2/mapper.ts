export const prefixMapping: Record<string, string> = {
  cosmos: 'cosmos',
  juno: 'juno',
  terra: 'terra',
  terra2: 'terra',
  chihuahua: 'chihuahua',
  injective: 'inj',
};

// Keys are bech32 prefixes
export const hdPathMapping: Record<string, number> = {
  cosmos: 118,
  juno: 118,
  terra: 330,
  terra2: 330,
  injective: 60,
};

export const connectorMap: Record<string, string[]> = {
  migaloo: ['white_whale'],
  terra2: ['white_whale'],
  juno: ['white_whale'],
  injective: ['white_whale'],
};
