// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.27.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

export interface InstantiateMsg {
  fee_collector_addr: string;
  pair_code_id: number;
  token_code_id: number;
  trio_code_id: number;
}
export type ExecuteMsg =
  | {
      update_config: {
        fee_collector_addr?: string | null;
        owner?: string | null;
        pair_code_id?: number | null;
        token_code_id?: number | null;
        trio_code_id?: number | null;
      };
    }
  | {
      update_pair_config: {
        feature_toggle?: FeatureToggle | null;
        fee_collector_addr?: string | null;
        owner?: string | null;
        pair_addr: string;
        pool_fees?: PoolFee | null;
      };
    }
  | {
      update_trio_config: {
        amp_factor?: RampAmp | null;
        feature_toggle?: FeatureToggle | null;
        fee_collector_addr?: string | null;
        owner?: string | null;
        pool_fees?: PoolFee | null;
        trio_addr: string;
      };
    }
  | {
      create_pair: {
        asset_infos: [AssetInfo, AssetInfo];
        pair_type: PairType;
        pool_fees: PoolFee;
        token_factory_lp: boolean;
      };
    }
  | {
      create_trio: {
        amp_factor: number;
        asset_infos: [AssetInfo, AssetInfo, AssetInfo];
        pool_fees: PoolFee;
        token_factory_lp: boolean;
      };
    }
  | {
      add_native_token_decimals: {
        decimals: number;
        denom: string;
      };
    }
  | {
      migrate_pair: {
        code_id?: number | null;
        contract: string;
      };
    }
  | {
      migrate_trio: {
        code_id?: number | null;
        contract: string;
      };
    }
  | {
      remove_pair: {
        asset_infos: [AssetInfo, AssetInfo];
      };
    }
  | {
      remove_trio: {
        asset_infos: [AssetInfo, AssetInfo, AssetInfo];
      };
    };
export type Decimal = string;
export type AssetInfo =
  | {
      token: {
        contract_addr: string;
      };
    }
  | {
      native_token: {
        denom: string;
      };
    };
export type PairType =
  | 'constant_product'
  | {
      stable_swap: {
        amp: number;
      };
    };
export interface FeatureToggle {
  deposits_enabled: boolean;
  swaps_enabled: boolean;
  withdrawals_enabled: boolean;
}
export interface PoolFee {
  burn_fee: Fee;
  protocol_fee: Fee;
  swap_fee: Fee;
}
export interface Fee {
  share: Decimal;
}
export interface RampAmp {
  future_a: number;
  future_block: number;
}
export type QueryMsg =
  | {
      config: {};
    }
  | {
      pair: {
        asset_infos: [AssetInfo, AssetInfo];
      };
    }
  | {
      pairs: {
        limit?: number | null;
        start_after?: [AssetInfo, AssetInfo] | null;
      };
    }
  | {
      trio: {
        asset_infos: [AssetInfo, AssetInfo, AssetInfo];
      };
    }
  | {
      trios: {
        limit?: number | null;
        start_after?: [AssetInfo, AssetInfo, AssetInfo] | null;
      };
    }
  | {
      native_token_decimals: {
        denom: string;
      };
    };
export interface MigrateMsg {}
export interface ConfigResponse {
  fee_collector_addr: string;
  owner: string;
  pair_code_id: number;
  token_code_id: number;
  trio_code_id: number;
}
export interface NativeTokenDecimalsResponse {
  decimals: number;
}
export interface PairInfo {
  asset_decimals: [number, number];
  asset_infos: [AssetInfo, AssetInfo];
  contract_addr: string;
  liquidity_token: AssetInfo;
  pair_type: PairType;
}
export interface PairsResponse {
  pairs: PairInfo[];
}
export interface TrioInfo {
  asset_decimals: [number, number, number];
  asset_infos: [AssetInfo, AssetInfo, AssetInfo];
  contract_addr: string;
  liquidity_token: AssetInfo;
}
export interface TriosResponse {
  trios: TrioInfo[];
}
