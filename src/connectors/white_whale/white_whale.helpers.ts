import { AssetInfo } from './types/TerraswapFactory.types';
import { NativeAsset, ExternalAsset } from '../../chains/cosmosV2/types';
import { IBCMap } from '../../services/data-provider';
import { getIndex } from '../../chains/cosmosV2/utils';

export function isNativeToken(asset: AssetInfo): boolean {
  if (asset.hasOwnProperty('native_token')) {
    return true;
  }
  return false;
}

export function getTokenValue(asset: AssetInfo): string {
  if (isNativeToken(asset)) {
    return (asset as NativeAsset).native_token.denom;
  }
  return (asset as ExternalAsset).token.contract_addr;
}

export function getTokenMetadataIndex(
  asset: AssetInfo,
  ibcMap: IBCMap,
  native_chain: string
): string | undefined {
  const tokenValue = getTokenValue(asset);
  let index: string | undefined;

  // Check if denom is an IBC or Factory hash;
  if (isIBCHash(tokenValue) || isFactoryHash(tokenValue)) {
    // Take a look at our IBC map to see if we have a mapping for this token;
    const ibcMappedToken = ibcMap?.get(tokenValue);
    if (ibcMappedToken) {
      // We have a mapping, so we can use the origin chain and denom to construct the index;
      // This index is used to query stored token metadata -> see src/services/data/token-metadata.json;
      index = getIndex(
        ibcMappedToken.origin.denom,
        ibcMappedToken.origin.chain
      );
    } else {
      throw new Error(`Token ${tokenValue} is not mapped to an origin`);
    }
  }
  // If not, then it means its probably a native token, so we just simply construct the index;
  else {
    index = getIndex(tokenValue, native_chain);
  }

  return index;
}

export function isIBCHash(denom: string): boolean {
  return denom.startsWith('ibc/');
}
export function isFactoryHash(denom: string): boolean {
  return denom.startsWith('factory/');
}
