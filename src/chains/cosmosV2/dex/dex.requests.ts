import { PairType as TerraswapPairType } from '../../../connectors/terraswap/interfaces/TerraswapFactory.types';

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
  asset_infos: [AssetInfo, AssetInfo];
  contract_addr: string;
  liquidity_token: AssetInfo;
  pair_type?: PairType;
}

export type IBCInfo = {
  path: string;
  origin: AssetOrigin;
};

export type AssetOrigin = {
  denom: string;
  chain: string;
};

export type AssetInfo = {
  symbol: string;
  decimals: number;
  denom: string; //Hash or denom
  ibc_info?: IBCInfo; // If token is native, this is undefined
  is_native: boolean;
};
