import { Asset } from './asset';

export type PairType =
  | 'constant_product'
  | {
      stable_swap: {
        amp: number;
      };
    };

export interface PairInfo {
    asset_infos: [Asset, Asset];
    symbol:string;
    contract_addr: string;
    liquidity_token: LiquidityToken;
    pair_type?: PairType;
}

export interface LiquidityToken {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
    mint: Mint;
}

interface Mint {
    minter: string;
    cap?: any;
}