import { loadData } from '../../services/data/dataloader';
import { Asset } from '../../chains/cosmosV2/types/asset';

export type IBCMap = Map<string, IBCTokenMetadata>;
export type TokenMetadataMap = Map<string, any>;

interface IBCTokenMetadata {
  chain: string;
  hash: string;
  supply: string;
  path: string;
  origin: Origin;
}

interface Origin {
  denom: string;
  chain: string;
}

export async function getIBCMap(): Promise<IBCMap> {
  const ibcMap = new Map<string, IBCTokenMetadata>();

  const rawJson = await loadData<IBCTokenMetadata>('ibc-denom-mappings.json');

  if (rawJson) {
    for (const [key, value] of Object.entries(rawJson)) {
      if (rawJson.hasOwnProperty(key)) {
        const typedValue: IBCTokenMetadata = value as IBCTokenMetadata;
        const normalizedKey = key.split('__')[0].replace(/\s/, '');

        ibcMap.set(normalizedKey, typedValue);
      }
    }
  }

  return ibcMap;
}

export async function getTokenMetadata(): Promise<TokenMetadataMap>{
  const tokenMetadata =  new Map<string, Asset>();

  const rawJson = await loadData<Asset>('token-metadata.json');

  if (rawJson) {
    for (const [key, value] of Object.entries(rawJson)) {
      if (rawJson.hasOwnProperty(key)) {
        const typedValue: Asset = value as Asset;

        tokenMetadata.set(key, typedValue);
      }
    }
  }

  return tokenMetadata;
}