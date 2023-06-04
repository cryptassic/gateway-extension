import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

import { CosmosV2 } from '../../chains/cosmosV2/cosmos';
import { getNetwork } from '../../chains/cosmosV2/utils';

import {
  Uint128,
  PairInfo,
  AssetInfo,
  EstimateSwapView,
  FinalExecuteResult,
  AbstractSwapConnector,
  TransactionSigningData,
} from '../connectors.base';

import {
  TerraswapRouterQueryClient,
  TerraswapFactoryQueryClient,
} from './types';

import { WhiteWhaleConfig } from './white_whale.config';
import { ClientsManager, getQueryClientBuilder } from '../connectors.clients';
import { PairDataTransformer } from './white_whale.transformers';

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
    //TODO: refactor getNetwork to const type.
    this._chain = CosmosV2.getInstance(chain, getNetwork(network));
  }

  // All Connectors must be initialized before usage.
  public async init(): Promise<void> {
    // Init Cosmos Chain
    if (!this._chain.ready()) {
      await this._chain.init();
    }

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
  pair(baseSymbol: string, quoteSymbol: string): Promise<PairInfo | undefined> {
    throw new Error('Method not implemented.');
  }

  //TODO(cryptassic): Add Tests for this method
  async pairs(
    limit?: number | undefined,
    startAfter?: AssetInfo[] | undefined,
    ..._args: any[]
  ): Promise<PairInfo[]> {
    const factoryQueryClient = this._clientsManager.getClient(
      TerraswapFactoryQueryClient
    );

    if (!factoryQueryClient) {
      throw new Error('Factory Query Client not initialized');
    }

    const pairsResponse = await factoryQueryClient.pairs({
      limit: limit,
      startAfter: startAfter,
    });
    const pairs = pairsResponse.pairs;

    const transformer = PairDataTransformer.getInstance();

    const pairsResult = transformer.transform(pairs, this._chain.chainName);

    return pairsResult;
  }
  estimateSellTrade(
    baseSymbol: string,
    quoteSymbol: string,
    amount: Uint128,
    allowedSlippage?: string | undefined
  ): Promise<EstimateSwapView> {
    throw new Error('Method not implemented.');
  }
  estimateBuyTrade(
    baseSymbol: string,
    quoteSymbol: string,
    amount: Uint128,
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
    const hasAllClientsDefined = this.hasAllClients();
    const areClientsReady = this._clientsManager.isReady;

    if (isChainReady && hasAllClientsDefined && areClientsReady) {
      return true;
    }

    return false;
  }

  private hasAllClients(): boolean {
    // Simple way to check if clientManager can find client and client is defined.
    const hasRouterQueryClient = !!this._clientsManager.getClient(
      TerraswapRouterQueryClient
    );
    const hasFactoryQueryClient = !!this._clientsManager.getClient(
      TerraswapFactoryQueryClient
    );

    return hasRouterQueryClient && hasFactoryQueryClient;
  }
  // These clients allows us to easily query/execute blockchain apps. This is generated using ts-codegen from white-whale-core contracts.
  private async _initClients(): Promise<void> {
    // This client is like http client that fethes data from blockchain. We use singleton, so all clients share same wasm client.
    // This way we can easily rate limit this client.
    const cosmWasmClient: CosmWasmClient =
      await this._chain.getCosmWasmClient();

    // Using generic getQueryClientBuilder to get required parameters for clientsManager initialization.
    // There are many types of clients, so we needed to create some generic manager who would allow us easily manage all clients accross this system.
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
}
