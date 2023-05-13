import { Asset, CosmosWallet, EncryptedPrivateKey } from '.';

import { IndexedTx, StargateClient } from '@cosmjs/stargate';

import { TokenListType, TokenValue } from '../../../services/base';
import { EvmTxStorage } from '../../../evm/evm.tx-storage';

import NodeCache from 'node-cache';

export enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export enum TransactionStatus {
  Success = 'success',
  Failure = 'failure',
}

export const SupportedChains = ['terra2', 'juno', 'chihuahua'];

/**
 * Defines the interface for a Cosmos provider that creates a base client with a specified chain configuration.
 */
export interface ICosmosProvider {
  /**
   * Creates a base client for a specified Cosmos chain.
   *
   * @param chainName - The name of the Cosmos chain.
   * @param rpcUrl - The URL of the RPC endpoint for the chain.
   * @param tokenListSource - The source of the token list for the chain.
   * @param tokenListType - The type of the token list for the chain.
   * @param transactionDbPath - The path to the transaction database for the chain.
   *
   * @returns A base client for the specified Cosmos chain.
   */
  createBase(
    chainName: string,
    rpcUrl: string,
    tokenListSource: string,
    tokenListType: TokenListType,
    transactionDbPath: string
  ): ICosmosBase;
}

export interface ICosmosBase {
  /**
   * Returns a boolean indicating whether the instance is ready for use.
   * @returns {boolean} - A boolean indicating whether the instance is ready for use.
   *
   * NOTE: This function should be used to check if the instance is ready before attempting to use it.
   * If it returns `false`, the instance may not be fully initialized or connected to the blockchain.
   */
  ready(): boolean;

  /**
   * Initializes the asset list by fetching the list of assets from a remote server
   * defined in `tokenListSource` and storing them in the `assetList` variable.
   * @returns {Promise<void>} - A Promise that resolves once the asset list has been successfully initialized and stored in `assetList`.
   *
   * NOTE: This function should be called at the start of the application to ensure that the asset list is up-to-date and available for use.
   */
  init(): Promise<void>;

  /**
   * Returns a Promise that resolves with an unsigned CosmWasmClient object representing the current provider for querying data on a CosmWasm blockchain.
   * @returns {Promise<CosmWasmClient>} - A Promise that resolves with an unsigned CosmWasmClient object representing the current provider for querying data on a CosmWasm blockchain.
   *
   * NOTE: The CosmWasmClient returned by this function is an unsigned client that only queries data, and cannot be used to submit transactions to the blockchain.
   */
  provider(): Promise<StargateClient>;

  /**
   * Returns an array of all stored asset objects.
   * @returns {Asset[]} - An array of all stored asset objects.
   */
  getStoredAssetList(): Asset[];

  /**
   * Returns the asset object associated with the specified asset symbol, if one exists.
   * @param {string} assetSymbol - The asset symbol to search for an asset object for.
   * @returns {Asset|undefined} - The asset object associated with the specified asset symbol, or undefined if no such asset exists.
   */
  getAssetBySymbol(assetSymbol: string): Asset | undefined;

  /**
   * Returns the asset object associated with the specified base currency symbol, if one exists.
   * @param {string} base - The base currency symbol to search for an asset object for.
   * @returns {Asset|undefined} - The asset object associated with the specified base currency symbol, or undefined if no such asset exists.
   */
  getAssetByBase(base: string): Asset | undefined;

  /**
   * Returns the number of decimal places used by the specified asset.
   * @param {Asset} asset - The asset to retrieve the decimal places for.
   * @returns {number} - The number of decimal places used by the asset.
   */
  getAssetDecimals(asset: Asset): number;

  /**
   * Retrieves the balances of all tokens in a specified Cosmos wallet.
   *
   * @async
   * @param {CosmosWallet} wallet - The cosmos wallet object.
   * @returns {Promise<Record<string, TokenValue>>} - A Promise that resolves with a Record object where the keys are token symbols and the values are TokenValue objects representing the balances.
   */
  getBalances(wallet: CosmosWallet): Promise<Record<string, TokenValue>>;

  /**
   * Returns a Promise that resolves with a CosmosWallet object representing the wallet associated with the specified address and prefix.
   * @param {string} address - The address associated with the wallet to retrieve.
   * @param {string} prefix - The prefix of the address associated with the wallet to retrieve.
   * @returns {Promise<CosmosWallet>} - A Promise that resolves with a CosmosWallet object representing the wallet associated with the specified address and prefix.
   *
   */
  getWallet(address: string, prefix: string): Promise<CosmosWallet>;

  /**
   * Returns a Promise that resolves with a CosmosWallet object representing the wallet associated with the specified private key and prefix.
   * @param {string} privateKey - The private key associated with the wallet to retrieve.
   * @param {string} prefix - The bech32 prefix of the address associated with the wallet to retrieve.
   * @returns {Promise<CosmosWallet>} - A Promise that resolves with a CosmosWallet object representing the wallet associated with the specified private key and prefix.
   *
   */
  getWalletFromPrivateKey(
    privateKey: string,
    prefix: string
  ): Promise<CosmosWallet>;

  /**
   * Returns a Promise that resolves with an AccountData object representing the account data associated with the specified mnemonic and prefix.
   * @param {string} mnemonic - The mnemonic associated with the account data to retrieve.
   * @param {string} prefix - The prefix of the address associated with the account data to retrieve.
   * @returns {Promise<AccountData>} - A Promise that resolves with an AccountData object representing the account data associated with the specified mnemonic and prefix.
   */
  getWalletFromMnemonic(
    mnemonic: string,
    prefix: string
  ): Promise<CosmosWallet>;

  /**
   * Returns a Promise that resolves with an encrypted version of the specified private key, using the specified password.
   * @param {string} privateKey - The private key to encrypt.
   * @param {string} password - The password to use for encryption.
   * @returns {Promise<string>} - A Promise that resolves with an encrypted version of the specified private key.
   */
  encrypt(privateKey: string, password: string): Promise<string>;

  /**
   * Returns a Promise that resolves with a CosmosWallet object representing the wallet associated with the specified encrypted private key, using the specified password and prefix.
   * @param {EncryptedPrivateKey} encryptedPrivateKey - The encrypted private key associated with the wallet to retrieve.
   * @param {string} password - The password to use for decryption.
   * @param {string} prefix - The prefix of the address associated with the wallet to retrieve.
   * @returns {Promise<CosmosWallet>} - A Promise that resolves with a CosmosWallet object representing the wallet associated with the specified encrypted private key, using the specified password and prefix.
   */
  decrypt(
    encryptedPrivateKey: EncryptedPrivateKey,
    password: string,
    prefix: string
  ): Promise<CosmosWallet>;

  /**
   * Caches the transaction receipt of the specified indexed transaction for later retrieval.
   * @param {IndexedTx} tx - The indexed transaction whose receipt to cache.
   * @returns {void}
   */
  cacheTransaction(tx: IndexedTx): void;

  retrieveTransaction(txHash: string): IndexedTx | undefined;

  /**
   * Retrieves the transaction receipt of the indexed transaction with the specified transaction hash.
   * @param {string} txHash - The transaction hash of the indexed transaction whose receipt to retrieve.
   * @returns {Promise<IndexedTx>} A promise that resolves to the transaction receipt of the indexed transaction.
   */
  getTransaction(txHash: string): Promise<IndexedTx>;

  /**
   * Retrieves the status of the indexed transaction with the specified transaction hash.
   * @param {string} txHash - The transaction hash of the indexed transaction to retrieve.
   * @returns {Promise<boolean>} A promise that resolves to the status of the indexed transaction.
   */
  getTransactionStatus(txHash: string): Promise<boolean>;

  /**
   * Retrieves the transaction history of the specified address.
   * @param {string} address - The address whose transaction history to retrieve.
   * @returns {Promise<IndexedTx[]>} A promise that resolves to an array of indexed transactions representing the transaction history of the address.
   */
  getTransactionHistory(address: string): Promise<IndexedTx[]>;

  /**
   * Retrieves the transaction history of the specified address for the specified asset.
   * @param {string} address - The address whose transaction history to retrieve.
   * @param {string} asset - The asset symbol whose transaction history to retrieve.
   * @returns {Promise<IndexedTx[]>} A promise that resolves to an array of indexed transactions representing the transaction history of the address for the specified asset.
   */
  getTransactionHistoryByAsset(
    address: string,
    asset: string
  ): Promise<IndexedTx[]>;

  /**
   * Returns the current block number of the connected blockchain.
   * @returns {Promise<number>} The current block number.
   */
  getCurrentBlockNumber(): Promise<number>;

  /**
   * Returns the chain ID of the connected blockchain.
   * @returns {Promise<string>} The chain ID.
   */
  getChainId(): Promise<string>;

  close(): Promise<void>;

  /**
   * The RPC URL used to connect to the blockchain.
   * @type {string}
   */
  rpcUrl: string;

  /**
   * The name of the connected blockchain.
   * @type {string}
   */
  chainName: string;

  /**
   * The URL of the remote server where the token list is stored.
   * @type {string}
   */
  tokenListSource: string;

  /**
   * The type of the token list.
   * @type {TokenListType}
   */
  tokenListType: TokenListType;

  /**
   * The cache used for storing transaction receipt data.
   * @type {NodeCache}
   */
  cache: NodeCache;

  /**
   * The storage used for storing transaction data.
   * @type {EvmTxStorage}
   */
  txStorage: EvmTxStorage;
}
