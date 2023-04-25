import { Cosmosish } from '../../../services/common-interfaces';
import { CosmosBase } from '../cosmos-base';
import { getCosmosConfigV2, Network } from '../cosmos.config';
import { logger } from '../../../services/logger';

export class Terra2 extends CosmosBase implements Cosmosish {
  private static _instances: { [name: string]: Terra2 };
  private _gasPrice: number;
  private _nativeTokenSymbol: string;
  private _chain: string;
  private _requestCount: number;
  private _metricsLogInterval: number;
  private _metricTimer;

  private constructor(network: Network) {
    const config = getCosmosConfigV2('terra2',network);
    super(
      'terra2',
      config.network.rpcURL,
      config.network.tokenListSource,
      config.network.tokenListType,
      config.manualGasPrice
    );
    this._chain = network;
    this._nativeTokenSymbol = config.nativeCurrencySymbol;

    this._gasPrice = config.manualGasPrice;

    this._requestCount = 0;
    this._metricsLogInterval = 300000; // 5 minutes

    this._metricTimer = setInterval(
      this.metricLogger.bind(this),
      this.metricsLogInterval
    );
  }

  public static getInstance(network: Network): Terra2 {
    if (Terra2._instances === undefined) {
      Terra2._instances = {};
    }
    if (!(network in Terra2._instances)) {
      Terra2._instances[network] = new Terra2(network);
    }
    return Terra2._instances[network];
  }


  public static getConnectedInstances(): { [name: string]: Terra2 } {
    return Terra2._instances;
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
    return this._chain;
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
    if (this._chain in Terra2._instances) {
      delete Terra2._instances[this._chain];
    }
  }
}
