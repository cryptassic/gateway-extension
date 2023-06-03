import { PairType as TerraswapPairType } from '../../../connectors/terraswap/types/TerraswapFactory.types';
import { PairInfo } from '../../../connectors/connectors.base';

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
