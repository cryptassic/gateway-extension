import { TokenMetadata, EstimateSwapView } from 'coinalpha-ref-sdk';
import { Account } from 'near-api-js';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { TerraSwapish } from '../../services/common-interfaces';
import { CosmosV2 } from '../../chains/cosmosV2/cosmos';
import { WhiteWhaleConfig } from './terraswap.config';
import {
  TerraswapFactoryQueryClient,
  TerraswapRouterQueryClient,
} from './types';
import {
  IBCMap,
  TokenMetadataMap,
  getIBCMap,
  getTokenMetadata,
} from './data-provider';
import { getNetwork, getIndex } from '../../chains/cosmosV2/utils';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

import { Asset, LiquidityToken, PairInfo } from '../../chains/cosmosV2/types';

import { getTokenMetadataIndex, getTokenValue } from './helpers';
import { logger } from '../../services/logger';
import { AssetInfo } from './types/TerraswapFactory.types';

export interface IBCData {
  chain: string;
  hash: string;
  supply: string;
  path: string;
  origin: TokenOrigin;
}

export interface TokenOrigin {
  chain: string;
  denom: string;
}

function isStringProperty(obj: any, propertyName: string): boolean {
  return typeof obj[propertyName] === 'string';
}

export class WhiteWhale implements TerraSwapish {
  private static _instances: { [name: string]: WhiteWhale };

  private _ttl: number;
  private _gasLimitEstimate: number;
  private _ready: boolean = false;

  private _router: string;
  private _factory: string;
  private _ibcTokenMap: IBCMap | undefined;
  private _tokenMetadata: TokenMetadataMap | undefined;

  private _routerQueryClient: TerraswapRouterQueryClient | undefined;
  private _factoryQueryClient: TerraswapFactoryQueryClient | undefined;

  private _chain: CosmosV2;

  public get ttl(): number {
    return this._ttl;
  }

  public get gasLimitEstimate(): number {
    return this._gasLimitEstimate;
  }
  /**
   * @param chain - The chain to connect to
   * @param network - The network to connect to
   */
  private constructor(chain: string, network: string) {
    const config = WhiteWhaleConfig.config;

    this._ttl = config.ttl;
    this._gasLimitEstimate = config.gasLimitEstimate;
    this._router = config.routerAddress(chain, network);
    this._factory = config.factoryAddress(chain, network);

    this._chain = CosmosV2.getInstance(chain, getNetwork(network));
  }

  private async _initIBCMap(): Promise<void> {
    const ibcMap = await getIBCMap();

    if (!ibcMap || ibcMap.size === 0) {
      throw new Error('Unable to get IBC Map');
    }

    this._ibcTokenMap = ibcMap;
  }

  private async _initQueryClients(): Promise<void> {
    const cosmWasmClient: CosmWasmClient =
      await this._chain.getCosmWasmClient();

    if (!this._routerQueryClient) {
      this._routerQueryClient = new TerraswapRouterQueryClient(
        cosmWasmClient,
        this._router
      );
    }

    if (!this._factoryQueryClient) {
      this._factoryQueryClient = new TerraswapFactoryQueryClient(
        cosmWasmClient,
        this._factory
      );
    }
  }

  private async _initTokenMetadata(): Promise<void> {
    const tokenMetadata = await getTokenMetadata();

    if (!tokenMetadata || tokenMetadata.size === 0) {
      throw new Error('Unable to get Token Metadata');
    }

    this._tokenMetadata = tokenMetadata;
  }

  public async init(): Promise<void> {
    // Init Cosmos Chain
    if (!this._chain.ready()) {
      await this._chain.init();
    }

    // Init IBC Token Map
    if (this._ibcTokenMap === undefined || this._ibcTokenMap.size === 0) {
      await this._initIBCMap();
    }

    // Init Token Metadata
    if (this._tokenMetadata === undefined || this._tokenMetadata.size === 0) {
      await this._initTokenMetadata();
    }

    // Init Query and Factory Clients
    if (!this._routerQueryClient || !this._factoryQueryClient) {
      await this._initQueryClients();
    }

    // Check if all is ready
    if (this.isReadyToSetFlag()) {
      this._ready = true;
    } else {
      throw new Error('Unable to initialize WhiteWhale');
    }
  }

  // Checks if all the required data is ready to be used.
  // This is used to set ready flag.
  private isReadyToSetFlag(): boolean {
    const isChainReady = this._chain.ready();

    const ibcTokenMapSize = this._ibcTokenMap?.size || 0;
    const tokenMetadataMapSize = this._tokenMetadata?.size || 0;

    const hasNonEmptyIbcTokenMap = ibcTokenMapSize > 0;
    const hasNonEmptyTokenMetadataMap = tokenMetadataMapSize > 0;

    // The variable hasRouterQueryClient will be true if this._routerQueryClient has a truthy value,
    // and false if this._routerQueryClient is falsy or undefined.
    const hasRouterQueryClient = !!this._routerQueryClient;
    const hasFactoryQueryClient = !!this._factoryQueryClient;

    if (
      isChainReady &&
      hasNonEmptyIbcTokenMap &&
      hasNonEmptyTokenMetadataMap &&
      hasRouterQueryClient &&
      hasFactoryQueryClient
    ) {
      return true;
    }

    return false;
  }

  public ready(): boolean {
    return this._ready;
  }

  public static getInstance(chain: string, network: string): WhiteWhale {
    const index = getIndex(chain, network);

    if (WhiteWhale._instances === undefined) {
      WhiteWhale._instances = {};
    }
    if (!(index in WhiteWhale._instances)) {
      WhiteWhale._instances[index] = new WhiteWhale(chain, network);
    }

    return WhiteWhale._instances[index];
  }

  /**
   * @todo
   * @returns {availablePairs} - Returns an array of available pairs in string format
   */
  async pairs(limit?: number, start_after?: AssetInfo[]): Promise<PairInfo[]> {
    if (!this._factoryQueryClient) {
      throw new Error('Factory Query Client not initialized');
    }
    if (!this._ibcTokenMap) {
      throw new Error('IBC Token Map not initialized');
    }

    //TODO(cryptassic): Include additional call on  each pair to get config and this way include fee rates in PairInfo[]
    const pairsResponse = await this._factoryQueryClient.pairs({
      limit: limit,
      startAfter: start_after,
    });

    const pairsResult: PairInfo[] = [];

    const pairs = pairsResponse.pairs;

    pairs.forEach((pair) => {
      try {
        const index1 = getTokenMetadataIndex(
          pair.asset_infos[0],
          this._ibcTokenMap as IBCMap,
          this._chain.chainName
        );
        const index2 = getTokenMetadataIndex(
          pair.asset_infos[1],
          this._ibcTokenMap as IBCMap,
          this._chain.chainName
        );

        // LP Token Index
        let lpTokenAddress;
        if (isStringProperty(pair, 'liquidity_token')) {
          lpTokenAddress = pair.liquidity_token;
        } else {
          lpTokenAddress = getTokenValue(pair.liquidity_token);
        }

        const indexLP = lpTokenAddress + '_' + this._chain.chainName;

        const asset1 = this._tokenMetadata?.get(index1 as string) as Asset;
        const asset2 = this._tokenMetadata?.get(index2 as string) as Asset;
        const assetLP = this._tokenMetadata?.get(
          indexLP as string
        ) as LiquidityToken;

        if (!asset1 || !asset2 || !assetLP) {
          logger.warn(
            `Pair: ${pair.contract_addr} - Failed to get Token Metadata for any of these [${index1},${index2},${assetLP}]`
          );
          return;
        }

        const pairInfo: PairInfo = {
          asset_infos: [asset1, asset2],
          symbol: `${asset1?.symbol}-${asset2?.symbol}`,
          contract_addr: pair.contract_addr,
          liquidity_token: assetLP,
          pair_type: pair.pair_type,
        };

        pairsResult.push(pairInfo);
      } catch (e) {
        console.log(
          `Error ${e} getting Pairs Token Info: ${pair.asset_infos[0]} - ${pair.asset_infos[1]}`
        );
      }
    });
    return pairsResult;
  }

  // async simulateSwapOperations(
  //   offerAmount: string,
  //   pair: string
  // ): Promise<Uint128> {
  //   const operations = await this._routerQueryClient.swapRoute({
  //     askAssetInfo: this._chain.assetInfoFromSymbol(
  //       pair.substring(0, pair.indexOf('-'))
  //     ),
  //     offerAssetInfo: this._chain.assetInfoFromSymbol(
  //       pair.substring(pair.indexOf('-') + 1, pair.length)
  //     ),
  //   });
  //   const simulationResponse =
  //     await this._routerQueryClient.simulateSwapOperations({
  //       offerAmount,
  //       operations,
  //     });

  //   return simulationResponse.amount;
  // }

  estimateSellTrade(
    baseToken: TokenMetadata,
    quoteToken: TokenMetadata,
    amount: string,
    allowedSlippage?: string | undefined
  ): Promise<{ trade: EstimateSwapView[]; expectedAmount: string }> {
    throw new Error(
      `Method not implemented.${baseToken} ${quoteToken} ${amount} ${allowedSlippage}}`
    );
  }

  estimateBuyTrade(
    quoteToken: TokenMetadata,
    baseToken: TokenMetadata,
    amount: string,
    allowedSlippage?: string | undefined
  ): Promise<{ trade: EstimateSwapView[]; expectedAmount: string }> {
    throw new Error(
      `Method not implemented.${baseToken} ${quoteToken} ${amount} ${allowedSlippage}}`
    );
  }

  executeTrade(
    account: Account,
    trade: EstimateSwapView[],
    amountIn: string,
    tokenIn: TokenMetadata,
    tokenOut: TokenMetadata,
    allowedSlippage?: string | undefined
  ): Promise<FinalExecutionOutcome> {
    throw new Error(
      `Method not implemented. ${account} ${trade} ${amountIn} ${tokenIn} ${tokenOut} ${allowedSlippage}`
    );
  }
}
