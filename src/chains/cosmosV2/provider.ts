import Bottleneck from 'bottleneck';

import { Tendermint34Client, TendermintClient, HttpEndpoint } from '@cosmjs/tendermint-rpc';

import { Stream } from "xstream";
import * as requests from '@cosmjs/tendermint-rpc';
import * as responses from '@cosmjs/tendermint-rpc';



export const DEFAULT_LIMITER = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000,
});


export class RateLimitedTendermint34Client {
    private rateLimiter: Bottleneck;
    private tmClient: Tendermint34Client;

  
    public static async connect(endpoint: string | HttpEndpoint): Promise<TendermintClient>{
        const tmClient = await Tendermint34Client.connect(endpoint);

        return new RateLimitedTendermint34Client(tmClient) as any;
    }

    public static async create(
        tmClient: Tendermint34Client,
        limiter: Bottleneck,
      ): Promise<TendermintClient> {
        
        return new RateLimitedTendermint34Client(tmClient, limiter) as any;
    }

    protected constructor(tmClient: Tendermint34Client,limiter?: Bottleneck) {
        this.rateLimiter = limiter ?? DEFAULT_LIMITER;
        this.tmClient = tmClient;
    }

    public disconnect(): void {
        this.tmClient.disconnect();
    }

    public async abciInfo(): Promise<responses.AbciInfoResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.abciInfo());
    }
    public async abciQuery(params: requests.AbciQueryParams): Promise<responses.AbciQueryResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.abciQuery(params));
    }
    public async blockchain(minHeight?: number, maxHeight?: number): Promise<responses.BlockchainResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.blockchain(minHeight, maxHeight));
    }
    
    public async block(height?: number): Promise<responses.BlockResponse> {
        return await this.rateLimiter.schedule(() => this.tmClient.block(height));
    }
    public async blockResults(height?: number): Promise<responses.BlockResultsResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.blockResults(height));
    }
    public async blockSearch(params: requests.tendermint34.BlockSearchParams): Promise<requests.tendermint34.BlockSearchResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.blockSearch(params));
    }
    public async blockSearchAll(params: requests.tendermint34.BlockSearchParams): Promise<requests.tendermint34.BlockSearchResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.blockSearchAll(params));
    }

    public async broadcastTxSync(
        params: requests.BroadcastTxParams,
    ): Promise<responses.BroadcastTxSyncResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.broadcastTxSync(params));
    }
    
    public async broadcastTxAsync(
        params: requests.BroadcastTxParams,
    ): Promise<responses.BroadcastTxAsyncResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.broadcastTxAsync(params));
    }

    public async broadcastTxCommit(
        params: requests.BroadcastTxParams,
    ): Promise<responses.BroadcastTxCommitResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.broadcastTxCommit(params));
    }

    public async commit(height?: number): Promise<responses.CommitResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.commit(height));
    }
    public async genesis(): Promise<responses.GenesisResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.genesis());
    }
    public async health(): Promise<responses.HealthResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.health());
    }
    public async status(): Promise<responses.StatusResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.status());
    }

    public subscribeNewBlock(): Stream<responses.NewBlockEvent>{
        return this.tmClient.subscribeNewBlock();
    }
    public subscribeNewBlockHeader(): Stream<responses.NewBlockHeaderEvent>{
        return this.tmClient.subscribeNewBlockHeader();
    }
    public subscribeTx(query?: string): Stream<responses.TxEvent>{
        return this.tmClient.subscribeTx(query);
    }
    
    public async tx(params: requests.TxParams): Promise<responses.TxResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.tx(params));
    }
    public async txSearch(params: requests.TxSearchParams): Promise<responses.TxSearchResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.txSearch(params));
    }
    public async txSearchAll(params: requests.TxSearchParams): Promise<responses.TxSearchResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.txSearchAll(params));
    }
    public async numUnconfirmedTxs(): Promise<responses.NumUnconfirmedTxsResponse> {
        return await this.rateLimiter.schedule(() => this.tmClient.numUnconfirmedTxs());
    }

    public async validators(params: requests.ValidatorsParams): Promise<responses.ValidatorsResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.validators(params));
    }

    public async validatorsAll(height?: number): Promise<responses.ValidatorsResponse>{
        return await this.rateLimiter.schedule(() => this.tmClient.validatorsAll(height));
    }

}


