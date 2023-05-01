import { TokenMetadata, EstimateSwapView } from 'coinalpha-ref-sdk';
import { Account } from 'near-api-js';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { WhiteWhaleish } from '../../services/common-interfaces';
import { CosmosBase as Cosmos } from '../../chains/cosmosV2/cosmos-base';
import { TerraswapConfig } from './terraswap.config';
import {
  TerraswapFactoryQueryClient,
  TerraswapRouterQueryClient,
} from './interfaces';
import { Uint128 } from './interfaces/TerraswapRouter.types';

/**
 * @todo refactor to use cosmosv2 wrapper once implemented
 */
export class Terraswap implements WhiteWhaleish {
  private static _instances: { [name: string]: Terraswap };
  private cosmos: Cosmos;
  private _ttl: number;
  private _gasLimitEstimate: number;
  private _router: string;
  private _routerQueryClient: TerraswapRouterQueryClient;
  private _factory: string;
  private factoryQueryClient: TerraswapFactoryQueryClient;
  private tokenList: Record<string, TokenMetadata> = {};

  /**
   *
   * @param network - The network to onnect to
   * @todo replace **broken** "new Cosmos()" with this.cosmos = cosmos.getInstance(network); once Cosmos class implemented
   */
  private constructor(network: string) {
    const config = TerraswapConfig.config;
    this.cosmos = new Cosmos();
    this._ttl = TerraswapConfig.config.ttl;
    this._gasLimitEstimate = TerraswapConfig.config.gasLimitEstimate;
    this._router = config.terraswapRouterAddress(network);
    this._factory = config.terraswapFactoryAddress(network);
    // this.tokenList =
  }

  /**
   * @todo implement
   * @param denom - Denom of the native token
   * @returns {symbol} - Returns the symbol of the native token
   */
  async symbolFromDenom(denom: string) {
    const ibcData = require('./ibc-denom-mappings.json');
    if (!denom.startsWith('ibc/')) return denom;
    for (const key in ibcData) {
      if (key.startsWith(denom)) {
        const originDenom = ibcData[key]['origin']['denom'];
        if (originDenom.startsWith('factory')) {
          return originDenom.substring(originDenom.lastIndexOf('/') + 1);
        }
        return originDenom;
      }
    }
  }

  /**
   * @todo implement
   * @param address - Address of the cw20 token contract
   * @returns {symbol} - Returns the symbol of the cw20 token
   */
  async symbolFromAddress(address: string) {
    const tokenInfo = (
      await this.cosmos.getCosmWasmClient()
    ).queryContractSmart(address, {
      token_info: {},
    });

    const symbol = tokenInfo['symbol'];
    if (symbol.startsWith('factory')) {
      return symbol.substring(symbol.lastIndexOf('/') + 1);
    }
    return symbol;
  }

  /**
   * @todo
   * @returns {availablePairs} - Returns an array of available pairs in string format
   */
  async availablePairs(): Promise<string[]> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Method not implemented.');
    }

    const factoryQueryClient = new TerraswapFactoryQueryClient(
      await this.cosmos.getCosmWasmClient(),
      this._factory
    );

    const pairsResponse = await factoryQueryClient.pairs({
      limit: 30,
    });
    const pairs = pairsResponse.pairs;

    const availablePairs = [];

    for (const pair of pairs) {
      const assetInfos = pair.asset_infos;
      const asset1 = assetInfos[0];
      const asset2 = assetInfos[1];
      let token1Symbol;
      let token2Symbol;
      if ('token' in asset1) {
        token1Symbol = await this.symbolFromAddress(asset1.token.contract_addr);
      } else {
        token1Symbol = await this.symbolFromDenom(asset1.native_token.denom);
      }

      if ('token' in asset2) {
        token2Symbol = await this.symbolFromAddress(asset2.token.contract_addr);
      } else {
        token2Symbol = await this.symbolFromDenom(asset2.native_token.denom);
      }
      // Should look like 'ujuno-luna' once fully implemented
      const pairSymbol = `${token1Symbol}-${token2Symbol}`;
      availablePairs.push(pairSymbol);
    }
    return availablePairs;
  }

  async simulateSwapOperations(
    offerAmount: string,
    pair: string
  ): Promise<Uint128> {
    const operations = await this._routerQueryClient.swapRoute({
      askAssetInfo: this.cosmos.assetInfoFromSymbol(
        pair.substring(0, pair.indexOf('-'))
      ),
      offerAssetInfo: this.cosmos.assetInfoFromSymbol(
        pair.substring(pair.indexOf('-') + 1, pair.length)
      ),
    });
    const simulationResponse =
      await this._routerQueryClient.simulateSwapOperations({
        offerAmount,
        operations,
      });

    return simulationResponse.amount;
  }

  estimateSellTrade(
    baseToken: TokenMetadata,
    quoteToken: TokenMetadata,
    amount: string,
    allowedSlippage?: string | undefined
  ): Promise<{ trade: EstimateSwapView[]; expectedAmount: string }> {
    throw new Error('Method not implemented.');
  }
  estimateBuyTrade(
    quoteToken: TokenMetadata,
    baseToken: TokenMetadata,
    amount: string,
    allowedSlippage?: string | undefined
  ): Promise<{ trade: EstimateSwapView[]; expectedAmount: string }> {
    throw new Error('Method not implemented.');
  }
  executeTrade(
    account: Account,
    trade: EstimateSwapView[],
    amountIn: string,
    tokenIn: TokenMetadata,
    tokenOut: TokenMetadata,
    allowedSlippage?: string | undefined
  ): Promise<FinalExecutionOutcome> {
    throw new Error('Method not implemented.');
  }
}
