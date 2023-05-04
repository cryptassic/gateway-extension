/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.27.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { InstantiateMsg, ExecuteMsg, Decimal, AssetInfo, PairType, FeatureToggle, PoolFee, Fee, RampAmp, QueryMsg, MigrateMsg, ConfigResponse, NativeTokenDecimalsResponse, PairInfo, PairsResponse, TrioInfo, TriosResponse } from "./TerraswapFactory.types";
export interface TerraswapFactoryReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  pair: ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }) => Promise<PairInfo>;
  pairs: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: AssetInfo[];
  }) => Promise<PairsResponse>;
  trio: ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }) => Promise<TrioInfo>;
  trios: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: AssetInfo[];
  }) => Promise<TriosResponse>;
  nativeTokenDecimals: ({
    denom
  }: {
    denom: string;
  }) => Promise<NativeTokenDecimalsResponse>;
}
export class TerraswapFactoryQueryClient implements TerraswapFactoryReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.pair = this.pair.bind(this);
    this.pairs = this.pairs.bind(this);
    this.trio = this.trio.bind(this);
    this.trios = this.trios.bind(this);
    this.nativeTokenDecimals = this.nativeTokenDecimals.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  pair = async ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }): Promise<PairInfo> => {
    return this.client.queryContractSmart(this.contractAddress, {
      pair: {
        asset_infos: assetInfos
      }
    });
  };
  pairs = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: AssetInfo[];
  }): Promise<PairsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      pairs: {
        limit,
        start_after: startAfter
      }
    });
  };
  trio = async ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }): Promise<TrioInfo> => {
    return this.client.queryContractSmart(this.contractAddress, {
      trio: {
        asset_infos: assetInfos
      }
    });
  };
  trios = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: AssetInfo[];
  }): Promise<TriosResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      trios: {
        limit,
        start_after: startAfter
      }
    });
  };
  nativeTokenDecimals = async ({
    denom
  }: {
    denom: string;
  }): Promise<NativeTokenDecimalsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      native_token_decimals: {
        denom
      }
    });
  };
}
export interface TerraswapFactoryInterface extends TerraswapFactoryReadOnlyInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    feeCollectorAddr,
    owner,
    pairCodeId,
    tokenCodeId,
    trioCodeId
  }: {
    feeCollectorAddr?: string;
    owner?: string;
    pairCodeId?: number;
    tokenCodeId?: number;
    trioCodeId?: number;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  updatePairConfig: ({
    featureToggle,
    feeCollectorAddr,
    owner,
    pairAddr,
    poolFees
  }: {
    featureToggle?: FeatureToggle;
    feeCollectorAddr?: string;
    owner?: string;
    pairAddr: string;
    poolFees?: PoolFee;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  updateTrioConfig: ({
    ampFactor,
    featureToggle,
    feeCollectorAddr,
    owner,
    poolFees,
    trioAddr
  }: {
    ampFactor?: RampAmp;
    featureToggle?: FeatureToggle;
    feeCollectorAddr?: string;
    owner?: string;
    poolFees?: PoolFee;
    trioAddr: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  createPair: ({
    assetInfos,
    pairType,
    poolFees,
    tokenFactoryLp
  }: {
    assetInfos: AssetInfo[];
    pairType: PairType;
    poolFees: PoolFee;
    tokenFactoryLp: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  createTrio: ({
    ampFactor,
    assetInfos,
    poolFees,
    tokenFactoryLp
  }: {
    ampFactor: number;
    assetInfos: AssetInfo[];
    poolFees: PoolFee;
    tokenFactoryLp: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  addNativeTokenDecimals: ({
    decimals,
    denom
  }: {
    decimals: number;
    denom: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  migratePair: ({
    codeId,
    contract
  }: {
    codeId?: number;
    contract: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  migrateTrio: ({
    codeId,
    contract
  }: {
    codeId?: number;
    contract: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  removePair: ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
  removeTrio: ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]) => Promise<ExecuteResult>;
}
export class TerraswapFactoryClient extends TerraswapFactoryQueryClient implements TerraswapFactoryInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.updatePairConfig = this.updatePairConfig.bind(this);
    this.updateTrioConfig = this.updateTrioConfig.bind(this);
    this.createPair = this.createPair.bind(this);
    this.createTrio = this.createTrio.bind(this);
    this.addNativeTokenDecimals = this.addNativeTokenDecimals.bind(this);
    this.migratePair = this.migratePair.bind(this);
    this.migrateTrio = this.migrateTrio.bind(this);
    this.removePair = this.removePair.bind(this);
    this.removeTrio = this.removeTrio.bind(this);
  }

  updateConfig = async ({
    feeCollectorAddr,
    owner,
    pairCodeId,
    tokenCodeId,
    trioCodeId
  }: {
    feeCollectorAddr?: string;
    owner?: string;
    pairCodeId?: number;
    tokenCodeId?: number;
    trioCodeId?: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        fee_collector_addr: feeCollectorAddr,
        owner,
        pair_code_id: pairCodeId,
        token_code_id: tokenCodeId,
        trio_code_id: trioCodeId
      }
    }, fee, memo, funds);
  };
  updatePairConfig = async ({
    featureToggle,
    feeCollectorAddr,
    owner,
    pairAddr,
    poolFees
  }: {
    featureToggle?: FeatureToggle;
    feeCollectorAddr?: string;
    owner?: string;
    pairAddr: string;
    poolFees?: PoolFee;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_pair_config: {
        feature_toggle: featureToggle,
        fee_collector_addr: feeCollectorAddr,
        owner,
        pair_addr: pairAddr,
        pool_fees: poolFees
      }
    }, fee, memo, funds);
  };
  updateTrioConfig = async ({
    ampFactor,
    featureToggle,
    feeCollectorAddr,
    owner,
    poolFees,
    trioAddr
  }: {
    ampFactor?: RampAmp;
    featureToggle?: FeatureToggle;
    feeCollectorAddr?: string;
    owner?: string;
    poolFees?: PoolFee;
    trioAddr: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_trio_config: {
        amp_factor: ampFactor,
        feature_toggle: featureToggle,
        fee_collector_addr: feeCollectorAddr,
        owner,
        pool_fees: poolFees,
        trio_addr: trioAddr
      }
    }, fee, memo, funds);
  };
  createPair = async ({
    assetInfos,
    pairType,
    poolFees,
    tokenFactoryLp
  }: {
    assetInfos: AssetInfo[];
    pairType: PairType;
    poolFees: PoolFee;
    tokenFactoryLp: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      create_pair: {
        asset_infos: assetInfos,
        pair_type: pairType,
        pool_fees: poolFees,
        token_factory_lp: tokenFactoryLp
      }
    }, fee, memo, funds);
  };
  createTrio = async ({
    ampFactor,
    assetInfos,
    poolFees,
    tokenFactoryLp
  }: {
    ampFactor: number;
    assetInfos: AssetInfo[];
    poolFees: PoolFee;
    tokenFactoryLp: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      create_trio: {
        amp_factor: ampFactor,
        asset_infos: assetInfos,
        pool_fees: poolFees,
        token_factory_lp: tokenFactoryLp
      }
    }, fee, memo, funds);
  };
  addNativeTokenDecimals = async ({
    decimals,
    denom
  }: {
    decimals: number;
    denom: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      add_native_token_decimals: {
        decimals,
        denom
      }
    }, fee, memo, funds);
  };
  migratePair = async ({
    codeId,
    contract
  }: {
    codeId?: number;
    contract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      migrate_pair: {
        code_id: codeId,
        contract
      }
    }, fee, memo, funds);
  };
  migrateTrio = async ({
    codeId,
    contract
  }: {
    codeId?: number;
    contract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      migrate_trio: {
        code_id: codeId,
        contract
      }
    }, fee, memo, funds);
  };
  removePair = async ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      remove_pair: {
        asset_infos: assetInfos
      }
    }, fee, memo, funds);
  };
  removeTrio = async ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      remove_trio: {
        asset_infos: assetInfos
      }
    }, fee, memo, funds);
  };
}