// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

import { CosmosV2 } from '../../chains/cosmosV2/cosmos';
import { getNetwork } from '../../chains/cosmosV2/utils';

import {
  AbstractSwapConnector,
  AssetInfo,
  EstimateSwapView,
  FinalExecuteResult,
  PairInfo,
  TransactionSigningData,
} from '../connectors.base';

import {
  IBCMap,
  getIBCMap,
  TokenMetadataMap,
  getTokenMetadata,
} from '../terraswap/data-provider';

import {
  TerraswapRouterQueryClient,
  TerraswapFactoryQueryClient,
} from './types';

import { WhiteWhaleConfig } from './white_whale.config';
import { ClientsManager, getQueryClientBuilder } from '../connectors.clients';

export class WhiteWhales extends AbstractSwapConnector {
  public get ttl(): number {
    return this._ttl;
  }
  public get gasLimitEstimate(): number {
    return this._gasLimitEstimate;
  }

  private _ttl: number;
  private _gasLimitEstimate: number;
  private _ready: boolean = false;

  private readonly _router: string;
  private readonly _factory: string;
  private _ibcTokenMap: IBCMap | undefined;
  private _tokenMetadata: TokenMetadataMap | undefined;

  // private _routerQueryClient: TerraswapRouterQueryClient | undefined;
  private _factoryQueryClient: TerraswapFactoryQueryClient | undefined;

  private readonly _clientsManager: ClientsManager;
  private readonly _chain: CosmosV2;

  constructor(chain: string, network: string) {
    super();
    const config = WhiteWhaleConfig.config;

    this._ttl = config.ttl;
    this._gasLimitEstimate = config.gasLimitEstimate;
    this._router = config.routerAddress(chain, network);
    this._factory = config.factoryAddress(chain, network);

    this._clientsManager = ClientsManager.getInstance();
    this._chain = CosmosV2.getInstance(chain, getNetwork(network));
  }

  // All Connectors must be initialized before usage.
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

    this._clientsManager.isReady;

    // Init Query and Factory Clients
    if (!this.hasAllClients()) {
      await this._initClients();
    }

    // Check if all is ready
    if (this.isReadyToSetFlag()) {
      this._ready = true;
    } else {
      throw new Error('Unable to initialize WhiteWhale');
    }
  }
  // Returns true if initialization was successful. Otherwise false.
  // Take a look at the init() method.
  public ready(): boolean {
    return this._ready;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /* eslint-disable no-unused-vars */
  pair(assetInfos: AssetInfo[]): Promise<PairInfo> {
    throw new Error('Method not implemented.');
  }

  async pairs(
    limit?: number | undefined,
    startAfter?: AssetInfo[] | undefined,
    ..._args: any[]
  ): Promise<PairInfo[]> {
    const factoryQueryClient = this._clientsManager.getClient(
      'TerraswapFactoryQueryClient'
    );

    if (!factoryQueryClient) {
      throw new Error('Factory Query Client not initialized');
    }
    if (!this._ibcTokenMap) {
      throw new Error('IBC Token Map not initialized');
    }

    //TODO(cryptassic): Include additional call on  each pair to get config and this way include fee rates in PairInfo[]
    const pairsResponse = await factoryQueryClient.pairs({
      limit: limit,
      startAfter: startAfter,
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
  estimateSellTrade(
    askAssetInfo: AssetInfo,
    offerAssetInfo: AssetInfo,
    amount: string,
    allowedSlippage?: string | undefined
  ): Promise<EstimateSwapView> {
    throw new Error('Method not implemented.');
  }
  estimateBuyTrade(
    askAssetInfo: AssetInfo,
    offerAssetInfo: AssetInfo,
    amount: string,
    allowedSlippage?: string | undefined
  ): Promise<EstimateSwapView> {
    throw new Error('Method not implemented.');
  }
  executeTradeLocallySigned(
    account: string,
    trade: EstimateSwapView[],
    amountIn: string,
    tokenIn: AssetInfo,
    tokenOut: AssetInfo,
    allowedSlippage?: string | undefined
  ): Promise<FinalExecuteResult> {
    throw new Error('Method not implemented.');
  }
  getTransactionSigningData(
    account: string,
    trade: EstimateSwapView[],
    amountIn: string,
    tokenIn: AssetInfo,
    tokenOut: AssetInfo,
    allowedSlippage?: string | undefined
  ): Promise<TransactionSigningData> {
    throw new Error('Method not implemented.');
  }
  executeTradeExternallySigned(data: TxRaw): Promise<FinalExecuteResult> {
    throw new Error('Method not implemented.');
  }
  /* eslint-enable no-unused-vars */
  /* eslint-disable @typescript-eslint/no-unused-vars */

  // Checks if all the required data is ready to be used.
  // This is used to set ready flag.
  private isReadyToSetFlag(): boolean {
    const isChainReady = this._chain.ready();

    const ibcTokenMapSize = this._ibcTokenMap?.size || 0;
    const tokenMetadataMapSize = this._tokenMetadata?.size || 0;

    const hasNonEmptyIbcTokenMap = ibcTokenMapSize > 0;
    const hasNonEmptyTokenMetadataMap = tokenMetadataMapSize > 0;

    const hasAllClientsDefined = this.hasAllClients();
    const areClientsReady = this._clientsManager.isReady;

    if (
      isChainReady &&
      hasNonEmptyIbcTokenMap &&
      hasNonEmptyTokenMetadataMap &&
      hasAllClientsDefined &&
      areClientsReady
    ) {
      return true;
    }

    return false;
  }

  private hasAllClients(): boolean {
    // Simple way to check if clientManager can find client and client is defined.
    const hasRouterQueryClient = !!this._clientsManager.getClient(
      'TerraswapRouterQueryClient'
    );
    const hasFactoryQueryClient = !!this._clientsManager.getClient(
      'TerraswapFactoryQueryClient'
    );

    return hasRouterQueryClient && hasFactoryQueryClient;
  }
  // We need IBC mapping to resolve assets found in pools. This allows us to append more information
  // to each asset.
  private async _initIBCMap(): Promise<void> {
    const ibcMap = await getIBCMap();

    if (!ibcMap || ibcMap.size === 0) {
      throw new Error('Unable to get IBC Token Map');
    }

    this._ibcTokenMap = ibcMap;
  }
  // These clients allows us to easily query/execute blockchain apps. This is generated using ts-codegen from white-whale-core contracts.
  private async _initClients(): Promise<void> {
    // This client is like http client that fethes data from blockchain. We use singleton, so all clients share same wasm client.
    // This way we can easily rate limit this client.
    const cosmWasmClient: CosmWasmClient =
      await this._chain.getCosmWasmClient();

    // Using generic getQueryClientBuilder to get required parameters for clientsManager initialization.
    // There are many types of clients, so we needed to create some generic manager who would allow us easily manage all clients accross this system.
    // Otherwise it would looked like this:
    // const routerQueryClient = ...;
    // const factoryQueryClient = ...;
    // const routerExecuteClient = ...;
    // const pairQueryClientPairA = ...;
    // const pairQueryClientPairB = ...;
    // And so on.
    // with clientsManager:
    //   clientsManager.getClient('TerraswapRouterQueryClient');
    //   clientsManager.getClient('TerraswapFactoryQueryClient');
    //   clientsManager.getClient('TerraswapRouterExecuteClient');
    //   clientsManager.getClient('TerraswapPairQueryClient_{contract_address}');
    //   clientsManager.getClient('TerraswapPairQueryClient_{contract_address}');
    // And so on.
    const routerQueryClient = this._clientsManager.getClient(
      'TerraswapRouterQueryClient'
    );
    const factoryQueryClient = this._clientsManager.getClient(
      'TerraswapFactoryQueryClient'
    );
    const routerQueryBuilder = getQueryClientBuilder(
      TerraswapRouterQueryClient,
      cosmWasmClient,
      this._router
    );
    // Same goes for factory clients.
    const factoryQueryBuilder = getQueryClientBuilder(
      TerraswapFactoryQueryClient,
      cosmWasmClient,
      this._factory
    );

    // Then we simply register them at clientManager where they will be accessed globally.
    this._clientsManager.addClients([routerQueryBuilder, factoryQueryBuilder]);
  }
  // We use tokens metadata to further augment the information returned to the user.
  // It goes together with IBC Maps.
  private async _initTokenMetadata(): Promise<void> {
    const tokenMetadata = await getTokenMetadata();

    if (!tokenMetadata || tokenMetadata.size === 0) {
      throw new Error('Unable to get Token Metadata');
    }

    this._tokenMetadata = tokenMetadata;
  }
}
