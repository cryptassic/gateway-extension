import { Asset } from '../chains/cosmosV2/types/asset';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { EncodeObject } from '@cosmjs/proto-signing';
import { StdFee, SignerData } from '@cosmjs/stargate';

// ----------------------------------------------------------------
//Region: General
// ----------------------------------------------------------------

export type Uint128 = string;

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

// ----------------------------------------------------------------
//Region: Pair
// ----------------------------------------------------------------

export interface PairInfo {
  asset_infos: [Asset, Asset];
  symbol: string;
  contract_addr: string;
  liquidity_token: LiquidityToken;
  pair_type?: PairType;
}

export type PairType =
  | 'constant_product'
  | {
      stable_swap: {
        amp: number;
      };
    };

export interface LiquidityToken {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
  mint: Mint;
}

export interface Mint {
  minter: string;
  cap?: any;
}

// ----------------------------------------------------------------
//Region: Swap
// ----------------------------------------------------------------

export interface Route {
  id: number;
  pair: PairInfo;
  operation: SwapOperation;
  simulation_result: EstimateSwapView;
}

export interface EstimateSwapView {
  fee: Uint128;
  spread: Uint128;
  return_amount: Uint128;
  path: Route[];
}

export interface FinalExecuteResult {
  execute_result: any;
}

// Used for signing swap transactions remotely.
export interface TransactionSigningData {
  signerAddress: string;
  messages: readonly EncodeObject[];
  fee: StdFee;
  memo: string;
  explicitSignerData?: SignerData;
}

// Parent class for all connectors.
export abstract class AbstractSwapConnector {
  abstract init(): Promise<void>;
  abstract ready(): boolean;

  abstract pair(
    baseSymbol: string,
    quoteSymbol: string
  ): Promise<PairInfo | undefined>;

  abstract pairs(
    limit?: number,
    startAfter?: AssetInfo[],
    ...args: any[]
  ): Promise<PairInfo[]>;

  abstract estimateSellTrade(
    baseSymbol: string,
    quoteSymbol: string,
    amount: Uint128,
    allowedSlippage?: string | undefined
  ): Promise<EstimateSwapView>;

  abstract estimateBuyTrade(
    baseSymbol: string,
    quoteSymbol: string,
    amount: Uint128,
    allowedSlippage?: string | undefined
  ): Promise<EstimateSwapView>;

  abstract executeTradeLocallySigned(
    account: string,
    trade: EstimateSwapView[],
    amountIn: Uint128,
    tokenIn: AssetInfo,
    tokenOut: AssetInfo,
    allowedSlippage?: string | undefined
  ): Promise<FinalExecuteResult>;

  // This used to request SignDoc for remote signing. After TransactionSigningData is signed,
  // users then can request execution from executeTradeExternallySigned function.
  abstract getTransactionSigningData(
    account: string,
    trade: EstimateSwapView[],
    amountIn: Uint128,
    tokenIn: AssetInfo,
    tokenOut: AssetInfo,
    allowedSlippage?: string | undefined
  ): Promise<TransactionSigningData>;

  abstract executeTradeExternallySigned(
    data: TxRaw
  ): Promise<FinalExecuteResult>;
}
// ----------------------------------------------------------------
//Region: Operations
// ----------------------------------------------------------------

export type TerraswapOperation = {
  terra_swap: {
    ask_asset_info: AssetInfo;
    offer_asset_info: AssetInfo;
  };
};

export type SwapOperation = TerraswapOperation;

export type ArrayOfSwapOperation = SwapOperation[];
