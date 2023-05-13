import { PairType as TerraswapPairType } from '../../../connectors/terraswap/types/TerraswapFactory.types';
import { Asset } from '../types/asset';

export type PairType = TerraswapPairType;

export interface PairsRequest {
  chain: string;
  network: string;
  connector: string;
  limit?: number;
  start_after?: string;
}

export interface PairsResponse {
  latency: number;
  pairs: PairInfo[];
}

export interface PairInfo {
  asset_infos: [AdditionalAssetInfo, AdditionalAssetInfo];
  contract_addr: string;
  liquidity_token: Asset;
  pair_type?: PairType;
}

export type AssetOrigin = {
  denom: string;
  chain: string;
};

export type IBCInfo = {
  path: string;
  origin: AssetOrigin;
};


export type AdditionalAssetInfo = {
  ibc_info: IBCInfo; // If token is native, this is undefined
  is_native: boolean;
}

export type ExtendedAssetInfo = Asset & AdditionalAssetInfo;
