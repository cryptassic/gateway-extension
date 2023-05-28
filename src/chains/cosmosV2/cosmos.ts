import { CosmosishV2 } from '../../services/common-interfaces';
import { CosmosBase } from './cosmos-base';
import { Network } from './types';
import { getCosmosConfigV2 } from '../cosmos/cosmos.config';
import { logger } from '../../services/logger';
import { getIndex } from './utils';

export class CosmosV2 extends CosmosBase implements CosmosishV2 {
  private static _instances: { [name: string]: CosmosV2 };
  private _gasPrice: number;
  private _nativeTokenSymbol: string;
  private _chainId: string;
  private _bech32Prefix: string;
  private _requestCount: number;
  private _metricsLogInterval: number;
  private _metricTimer;

  private constructor(chain: string, network: Network) {
    const config = getCosmosConfigV2(chain, network);
    super(
      chain,
      network,
      config.network.nodeURL,
      config.network.tokenListSource,
      config.network.tokenListType,
      './random_db_path'
    );
    this._chainId = config.network.chainId;
    this._bech32Prefix = config.network.bech32Prefix;

    this._nativeTokenSymbol = config.nativeCurrencySymbol;

    this._gasPrice = config.manualGasPrice;

    this._requestCount = 0;
    this._metricsLogInterval = 300000; // 5 minutes

    this._metricTimer = setInterval(
      this.metricLogger.bind(this),
      this.metricsLogInterval
    );
  }

  public static getInstance(chain: string, network: Network): CosmosV2 {
    const index = getIndex(chain, network);

    if (CosmosV2._instances === undefined) {
      CosmosV2._instances = {};
    }
    if (!(index in CosmosV2._instances)) {
      CosmosV2._instances[index] = new CosmosV2(chain, network);
    }
    return CosmosV2._instances[index];
  }

  public static getConnectedInstances(): { [name: string]: CosmosV2 } {
    return CosmosV2._instances;
  }

  public requestCounter(msg: any): void {
    if (msg.action === 'request') this._requestCount += 1;
  }

  public metricLogger(): void {
    logger.info(
      this.requestCount +
        ' request(s) sent in last ' +
        this.metricsLogInterval / 1000 +
        ' seconds.'
    );
    this._requestCount = 0; // reset
  }

  public get gasPrice(): number {
    return this._gasPrice;
  }

  public get chain(): string {
    return this.chainName;
  }

  public get chainId(): string {
    return this._chainId;
  }
  public get bech32Prefix(): string {
    return this._bech32Prefix;
  }

  public get nativeTokenSymbol(): string {
    return this._nativeTokenSymbol;
  }

  public get requestCount(): number {
    return this._requestCount;
  }

  public get metricsLogInterval(): number {
    return this._metricsLogInterval;
  }

  async close() {
    clearInterval(this._metricTimer);
    const index: string = `${this.chain}_${this.network}`;
    if (index in CosmosV2._instances) {
      delete CosmosV2._instances[index];
    }
  }
}
