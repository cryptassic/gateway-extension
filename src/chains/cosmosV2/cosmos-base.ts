import { 
  Asset, 
  CosmosWallet, 
  EncryptedPrivateKey, 
  ICosmosBase,
  ProviderNotInitializedError, 
} from './types';

import fse from 'fs-extra';
import { promises as fs } from 'fs';

import axios from 'axios';
import NodeCache from 'node-cache';
import Bottleneck from 'bottleneck';

import { Network } from './types';

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { IndexedTx, StargateClient } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

import { TokenInfo, TokenListType, TokenValue, walletPath } from '../../services/base';

import { ConfigManagerCertPassphrase } from '../../services/config-manager-cert-passphrase';
import { ReferenceCountingCloseable } from '../../services/refcounting-closeable';
import { EvmTxStorage } from '../../evm/evm.tx-storage';

import { Crypto } from './crypto';
import { BigNumber } from 'ethers';
import { resolveDBPath } from './utils';
import { DEFAULT_LIMITER, RateLimitedTendermint34Client} from './provider';

const { fromBase64 } = require('@cosmjs/encoding');


export class CosmosBase extends Crypto implements ICosmosBase {
  
  private _providerStargate: StargateClient | undefined;
  private _tmClient: Tendermint34Client | undefined;
  private _cosmWasmClient: CosmWasmClient | undefined;
  private _rateLimiter: Bottleneck | undefined;

  protected tokenList: TokenInfo[] = [];
  protected assetList: Asset[] = [];
  private _assetMap: Record<string, Asset> = {};

  private _ready: boolean = false;
  private _initializing: boolean = false;
  private _initPromise: Promise<void> = Promise.resolve();

  private _rpcUrl: string;
  private _network: Network;
  private _chainName: string;
  private _tokenListSource: string;
  private _tokenListType: TokenListType;
  private readonly _cache: NodeCache;
  private readonly _refCountingHandle: string;
  private readonly _txStorage: EvmTxStorage;

  public constructor(
    chainName: string,
    network: Network,
    rpcUrl: string,
    tokenListSource: string,
    tokenListType: TokenListType,
    transactionDbPath: string,
    limiter?: Bottleneck
  ) {
    super();
    this._network = network;
    this._rpcUrl = rpcUrl;
    this._chainName = chainName;
    this._rateLimiter = limiter ?? DEFAULT_LIMITER;

    this._tokenListSource = tokenListSource;
    this._tokenListType = tokenListType;
    this._cache = new NodeCache({ stdTTL: 3600 }); // set default cache ttl to 1hr

    this._refCountingHandle = ReferenceCountingCloseable.createHandle();
    this._txStorage = EvmTxStorage.getInstance(
      resolveDBPath(transactionDbPath),
      this._refCountingHandle
    );
  }

  ready(): boolean {
    return this._ready;
  }
  public get network(): string {
    return this._network;
  }

  public get rpcUrl(): string {
    return this._rpcUrl;
  }

  public get chainName(): string {
    return this._chainName;
  }

  public get tokenListSource(): string {
    return this._tokenListSource;
  }

  public get tokenListType(): TokenListType {
    return this._tokenListType;
  }

  public get storedTokenList(): TokenInfo[] {
    return this.tokenList;
  }

  public get cache(): NodeCache {
    return this._cache;
  }

  public get txStorage(): EvmTxStorage {
    return this._txStorage;
  }

  async init(): Promise<void> {
    if (!this.ready() && !this._initializing) {
      this._initializing = true;
      
      try{
        const defaultTM32Client = await Tendermint34Client.connect(this.rpcUrl);
  
        // Tendermint32Client does not expose its constructor, so we built a wrapper around it to throttle requests.
        // Throttling is required, because some public RPC endpoints are really sensitive.
        // If operating on a private RPC endpoint, you can pass a custom limiter to the constructor.
        this._tmClient = await RateLimitedTendermint34Client.create(defaultTM32Client, this._rateLimiter as Bottleneck) as Tendermint34Client;
        this._cosmWasmClient = await CosmWasmClient.create(defaultTM32Client);

        if(!this._tmClient || !this._cosmWasmClient){
          return Promise.reject(new ProviderNotInitializedError('Either Tendermint client or CosmWasm client not initialized'));
        }
      }
      catch(error){
        return Promise.reject(new ProviderNotInitializedError("Can't connect to Tendermint34Client",error));
      }

      this._providerStargate = await StargateClient.create(this._tmClient);

      const defaultTM32Client = await Tendermint34Client.connect(this.rpcUrl);

      // Tendermint32Client does not expose its constructor, so we built a wrapper around it to throttle requests.
      // Throttling is required, because some public RPC endpoints are really sensitive.
      // If operating on a private RPC endpoint, you can pass a custom limiter to the constructor.
      this._tmClient = (await RateLimitedTendermint34Client.create(
        defaultTM32Client,
        this._rateLimiter as Bottleneck
      )) as Tendermint34Client;
      this._cosmWasmClient = await CosmWasmClient.create(defaultTM32Client);

      if (!this._tmClient) {
        return Promise.reject(new Error('Tendermint client not initialized'));
      }

      this._providerStargate = await StargateClient.create(this._tmClient);

      this._initPromise = this.loadAssets(
        this.tokenListSource,
        this.tokenListType
      ).then(() => {
        this._ready = true;
        this._initializing = false;
      });
    }
    return this._initPromise;
  }

  provider(): Promise<StargateClient>{
    if(!this._providerStargate){
      return Promise.reject( new ProviderNotInitializedError("Stargate client not initialized"));
    }

    return Promise.resolve(this._providerStargate);
  }
  getTM32Client(): Promise<Tendermint34Client>{
    if(!this._tmClient){
      return Promise.reject( new ProviderNotInitializedError("Tendermint client not initialized"));
    }

    return Promise.resolve(this._tmClient);
  }
  getCosmWasmClient(): Promise<CosmWasmClient>{
    if(!this._cosmWasmClient){
      return Promise.reject( new ProviderNotInitializedError("CosmWasm client not initialized"));
    }

    return Promise.resolve(this._cosmWasmClient);

  }
  getStoredAssetList(): Asset[] {
    return this.assetList;
  }

  getTokenForSymbol(symbol: string): TokenInfo | undefined {
    return this.tokenList.find(token => token.symbol.toUpperCase() === symbol.toUpperCase());
  }

  getAssetBySymbol(assetSymbol: string): Asset | undefined {
    return this.assetList.find(
      (asset) => asset.symbol.toUpperCase() === assetSymbol.toUpperCase()
    );
  }
  getAssetByBase(base: string): Asset | undefined {
    return this.assetList.find(
      (asset: Asset) => asset.base.toUpperCase() === base.toUpperCase()
    );
  }
  getAssetDecimals(asset: Asset): number {
    return asset ? asset.denom_units[asset.denom_units.length - 1].exponent : 6; // Last denom unit has the decimal amount we need from our list
  }
  async getBalances(wallet: CosmosWallet): Promise<Record<string, TokenValue>> {
    const balances: Record<string, TokenValue> = {};

    const provider = await this.provider();

    const accounts = await wallet.getAccounts();

    const { address } = accounts[0];

    const allTokens = await provider.getAllBalances(address);

    await Promise.all(
      allTokens.map(async (t: { denom: string; amount: string }) => {
        let asset = this.getAssetByBase(t.denom);

        // TO-DO IBC token integration. Current support is only for native tokens.
        // if (!asset && t.denom.startsWith('ibc/')) {
        //   const ibcHash: string = t.denom.replace('ibc/', '');

        //   // Get base denom by IBC hash
        //   if (ibcHash) {
        //     const { denomTrace } = await setupIbcExtension(
        //       await this._providerStargate.queryClient
        //     ).ibc.transfer.denomTrace(ibcHash);

        //     if (denomTrace) {
        //       const { baseDenom } = denomTrace;

        //       asset = this.getTokenByBase(baseDenom);
        //     }
        //   }
        // }
        if (asset) {
          // Not all tokens are added in the registry so we use the denom if the token doesn't exist
          balances[asset ? asset.symbol : t.denom] = {
            value: BigNumber.from(parseInt(t.amount, 10)),
            decimals: this.getAssetDecimals(asset as Asset),
          };
        }
      })
    );

    return balances;
  }
  async getWallet(address: string, prefix: string): Promise<CosmosWallet> {
    const path = `${walletPath}/${this.chainName}`;

    let encryptedPrivateKey: EncryptedPrivateKey;

    try{
      encryptedPrivateKey = JSON.parse(
        await fse.readFile(`${path}/${address}.json`, 'utf8'),
        (key, value) => {
          switch (key) {
            case 'ciphertext':
            case 'salt':
            case 'iv':
              return fromBase64(value);
            default:
              return value;
          }
        }
      );
    }
    catch {
      return Promise.reject(new Error('Wallet not found'));
    }

    
    const passphrase = ConfigManagerCertPassphrase.readPassphrase();
    if (!passphrase) {
      return Promise.reject(new Error('missing passphrase'));
    }
    
    return await this.decrypt(encryptedPrivateKey, passphrase, prefix);
  }
  async getWalletFromPrivateKey(
    privateKey: string,
    prefix: string
  ): Promise<CosmosWallet> {
    return super.getWalletFromPrivateKey(privateKey, prefix);
  }

  async getWalletFromMnemonic(
    mnemonic: string,
    prefix: string
  ): Promise<CosmosWallet> {
    return super.getWalletFromMnemonic(mnemonic, prefix);
  }

  async encrypt(privateKey: string, password: string): Promise<string> {
    return super.encrypt(privateKey, password);
  }

  async decrypt(
    encryptedPrivateKey: EncryptedPrivateKey,
    password: string,
    prefix: string
  ): Promise<CosmosWallet> {
    return super.decrypt(encryptedPrivateKey, password, prefix);
  }

  cacheTransaction(tx: IndexedTx): void {
    this._cache.set(tx.hash, tx);
  }
    
  retrieveTransaction(txHash: string): IndexedTx | undefined {
    const tx = this._cache.get(txHash) as any;

    // NodeCache uses the built-in JSON.stringify and JSON.parse methods to store and retrieve values. 
    // When a Uint8Array is stringified using JSON.stringify, it is converted to an object with numeric keys, 
    // where each key represents an index in the array and each value represents the corresponding element of the array. 
    // This object can be represented as a Record<string, number> in TypeScript.
    //
    // What does that mean to us?
    // When we store a Uint8Array in the cache, it is converted to an object with numeric keys.
    // 
    // Example:
    // Uint8Array: [1, 2, 3, 4, 5] -> cache.set -> cache.get -> Object: {0: 1, 1: 2, 2: 3, 3: 4, 4: 5}
    // So, we can't do direct comparison... because it will fail with TypeError: this is not a typed array.
    // 
    // Solution: To convert the object back to Uint8Array. Ugly but works.
    if(tx){
      tx.tx = Uint8Array.from(Object.values(tx.tx));
    }

    return tx;
  }

  async getTransactionStatus(txHash: string): Promise<boolean> {
    const tx = await this.getTransaction(txHash);

    if (!tx) {
      return Promise.reject(new Error(`Transaction not found`));
    }

    return Promise.resolve(
      tx.code == 0 // 0 means success, anything else is an failure
    );
  }

  async getTransaction(txHash: string): Promise<IndexedTx> {
    if (this.cache.keys().includes(txHash)) {
      // If it's in the cache, return the value in cache, whether it's null or not
      return Promise.resolve(this.retrieveTransaction(txHash) as IndexedTx);
    } else {
      // If it's not in the cache,
      const provider = await this.provider();

      const fetchedTxReceipt = await provider.getTx(txHash);

      this.cache.set(txHash, fetchedTxReceipt); // Cache the fetched receipt, whether it's null or not

      // TO-DO This part requires WebSocketSupport to introduce events to update the cache.
      // if (!fetchedTxReceipt) {
      // this._provider.once(txHash, this.cacheTransactionReceipt.bind(this));
      // }

      if (!fetchedTxReceipt) {
        return Promise.reject(new Error('Transaction not found'));
      }

      return Promise.resolve(fetchedTxReceipt as IndexedTx);
    }
  }

  getTransactionHistory(address: string): Promise<IndexedTx[]> {
    return Promise.reject(new Error(`Method not implemented. [${address}]`));
  }

  getTransactionHistoryByAsset(
    address: string,
    asset: string
  ): Promise<IndexedTx[]> {
    return Promise.reject(
      new Error(`Method not implemented. [${address}, ${asset}]`)
    );
  }

  async getCurrentBlockNumber(): Promise<number> {
    const provider = await this.provider();
    return provider.getHeight();
  }

  async getChainId(): Promise<string> {
    const provider = await this.provider();
    return provider.getChainId();
  }

  async close(): Promise<void> {
    await this._txStorage.close(this._refCountingHandle);
  }

  async loadAssets(
    tokenListSource: string,
    tokenListType: TokenListType
  ): Promise<void> {

    this.assetList = await this.getAssetList(tokenListSource, tokenListType);
    this.tokenList = await this.convertAssets(this.assetList);

    if (this.assetList) {
      this.assetList.forEach(
        (asset: Asset) => (this._assetMap[asset.symbol] = asset)
      );
    }
  }

  async getAssetList(
    tokenListSource: string,
    tokenListType: TokenListType
  ): Promise<Asset[]> {
    let assets;
    if (tokenListType === 'URL') {
      ({
        data: { assets: assets },
      } = await axios.get(tokenListSource));
    } else {
      ({ assets } = JSON.parse(await fs.readFile(tokenListSource, 'utf8')));
    }
    return assets;
  }

  async convertAssets(assets: Asset[]): Promise<TokenInfo[]> {
    const tokens: TokenInfo[] = [];
    const chainId: number = this.network === 'mainnet' ? 1 : 2;
    
    assets.forEach((asset) => {
      tokens.push({
        chainId: chainId,
        address: asset.address ? asset.address : '',
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.denom_units[asset.denom_units.length - 1].exponent,
      })
    });

    return tokens;
  }

}
