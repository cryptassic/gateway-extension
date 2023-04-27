
// import { Asset } from '../../../src/chains/cosmosV2/types';
import { CosmosBase } from '../../../src/chains/cosmosV2/cosmos-base';
import { EvmTxStorage } from '../../../src/evm/evm.tx-storage';
import { Crypto } from '../../../src/chains/cosmosV2/crypto';

import { toHex } from '@cosmjs/encoding';
import { IndexedTx } from '@cosmjs/stargate';
import { storeWallet } from '../../../src/services/wallet/wallet.controllers';
import { ConfigManagerCertPassphrase } from '../../../src/services/config-manager-cert-passphrase';
import { TransactionStatus } from '../../../src/chains/cosmosV2/types';
// const dummyAsset: Asset = {
//     description: "The native staking and governance token of the Cosmos Hub.",
//     denom_units: [
//       {
//         denom: "uatom",
//         exponent: 0
//       },
//       {
//         denom: "atom",
//         exponent: 6
//       }
//     ],
//     base: "uatom",
//     name: "Cosmos Hub Atom",
//     display: "atom",
//     symbol: "ATOM",
//     logo_URIs: {
//       png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
//       svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg"
//     },
//     coingecko_id: "cosmos"
// };

const dummyWallet = {
    "mnemonic": "present picnic avocado noise mutual mountain make business sentence laptop rail hurt",
    "address": "cosmos18jyzpf3056rvcq3nuhrcwfk7vtcfayw9p2nl4u",
    "privateKey": "lNRbGdPclYqp2FVnw0dI/ZJxvOmGHNkawRi00xf+KVY="
} 
const cosmosNetworks = {
    "mainnet": {
        "chain": "cosmos",
        "rpc": "https://cosmos-rpc.polkachu.com/",
        "chainId": "cosmoshub-4",
    },
    "testnet": {
        "chain": "cosmos",
        "rpc": "https://cosmos-testnet-rpc.allthatnode.com:26657/",
        "chainId": "theta-testnet-001",
    },
}

// Manually verified
// For simplicity keeping rawLog and tx fields empty.
const testnetTxMetadata: IndexedTx = {
    height: 15691738,
    hash: "9AD9F104637589373EBD351506F6C8E455FB01946ECC981BA3B10220A8953019",
    code: 0,
    rawLog: '',
    tx: new Uint8Array(12),
    gasWanted: 200000,
    gasUsed: 80688,

}

const NETWORK = cosmosNetworks.testnet;
const PASSPHRASE = 'password';

describe('CosmosBase', () => {
  let cosmosBase: CosmosBase;
  beforeAll(async () => {

    // Bad practice, but we really really need this.
    const cryptoObj = new (class extends Crypto {
      public encryptWrapper(privateKey: string, password: string): Promise<string> {
        const privKeyHex = toHex(Uint8Array.from(Buffer.from(privateKey, 'base64')));
        return this.encrypt(privKeyHex, password);
      }
    })();

    const walletStoragePath = `./conf/wallets/cosmos`;
    const encryptedPrivateKey = await cryptoObj.encryptWrapper(dummyWallet.privateKey, PASSPHRASE)

    await storeWallet(walletStoragePath, dummyWallet.address, encryptedPrivateKey);
  });

  beforeEach(() => {
    cosmosBase = new CosmosBase(
      NETWORK.chain,
      NETWORK.rpc,
      'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/assetlist.json',
      'URL',
      './test/evm-tx-db'
    );
  });

  describe('constructor', () => {
    test('should create a CosmosBase instance with the correct properties', () => {
      expect(cosmosBase.chainName).toEqual(NETWORK.chain);
      expect(cosmosBase.rpcUrl).toEqual(NETWORK.rpc);
      expect(cosmosBase.tokenListSource).toEqual('https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/assetlist.json');
      expect(cosmosBase.tokenListType).toEqual('URL');
      expect(cosmosBase.cache).toBeDefined();
      expect(cosmosBase.txStorage).toBeInstanceOf(EvmTxStorage);
      expect(cosmosBase.ready()).toBeFalsy();
    });

    test('should inherit the Crypto class', () => {
      expect(cosmosBase).toBeInstanceOf(Crypto);
    });
  });

  describe('init', () => {
    it('should load assets and set _ready to true', async () => {
      await cosmosBase.init();

      expect(cosmosBase.ready()).toBe(true);
      expect(cosmosBase.getStoredAssetList()).toHaveLength(1);
      expect(cosmosBase.getAssetBySymbol('atom')).toBeDefined();
    });
  });

  describe('provider', () => {
    it('should return an error if _providerStargate is not initialized', async () => {
      await expect(cosmosBase.provider()).rejects.toThrow('Provider not initialized');
    });

    it('should return _providerStargate', async () => {
      await cosmosBase.init();
      const provider = await cosmosBase.provider();
      expect(provider).toBeDefined();
    });
  });

  describe('cache', () => {
    
    beforeEach(() => {
      cosmosBase.cache.flushAll();}
    );

    it('should store transaction at cache', () => {
      
      cosmosBase.cacheTransaction(testnetTxMetadata);

      const retrievedTx = cosmosBase.retrieveTransaction(testnetTxMetadata.hash) as IndexedTx;
      
      expect(retrievedTx).toBeDefined();
      expect(retrievedTx).not.toBeNull();



    });
    it('should retrieve transaction from cache before requesting from provider', async () => {
      
      const spy = jest.spyOn(cosmosBase, 'provider');

      cosmosBase.cacheTransaction(testnetTxMetadata);

      const retrievedTx = await cosmosBase.getTransaction(testnetTxMetadata.hash) as IndexedTx;

      expect(spy).not.toHaveBeenCalled();

      expect(testnetTxMetadata).toEqual(retrievedTx);
      
    });
  });

  describe('getStoredAssetList', () => {
    it('should return the list of stored assets', () => {
      expect(cosmosBase.getStoredAssetList()).toEqual([]);
    });
  });

  describe('getAssetBySymbol', () => {
    it('should return an asset with the given symbol', () => {
      const asset = { symbol: 'uatom' };
      cosmosBase['assetList'] = [asset as any];
      expect(cosmosBase.getAssetBySymbol('uatom')).toEqual(asset);
    });

    it('should return undefined if no asset with the given symbol is found', () => {
      expect(cosmosBase.getAssetBySymbol('btc')).toBeUndefined();
    });
  });

  describe('getAssetByBase', () => {
    it('should return an asset with the given base', () => {
      const asset = { base: 'uatom' };
      cosmosBase['assetList'] = [asset as any];
      expect(cosmosBase.getAssetByBase('uatom')).toEqual(asset);
    });

    it('should return undefined if no asset with the given base is found', () => {
      expect(cosmosBase.getAssetByBase('btc')).toBeUndefined();
    });
  });

  describe('getAssetDecimals', () => {
    it('should return the decimals of the given asset', () => {
      const asset = { denom_units: [{ exponent: 6 }, { exponent: 9 }] };
      expect(cosmosBase.getAssetDecimals(asset as any)).toBe(9);
    });

    it('should return 6 if no asset is given', () => {
      expect(cosmosBase.getAssetDecimals(undefined as any)).toBe(6);
    });
  });

  describe('getWallet', () => {
    it('should return a wallet from the given mnemonic', async () => {
        const wallet = await cosmosBase.getWalletFromMnemonic(dummyWallet.mnemonic,'cosmos');
        expect(wallet).toBeDefined();

        const accounts = await wallet.getAccounts();
        expect(accounts[0].address).toEqual(dummyWallet.address);
    });

    it('should return a wallet from the given private key', async () => {
        const privKey = toHex(Uint8Array.from(Buffer.from(dummyWallet.privateKey, 'base64')));
        const wallet = await cosmosBase.getWalletFromPrivateKey(privKey,'cosmos');
        expect(wallet).toBeDefined();

        const accounts = await wallet.getAccounts();
        expect(accounts[0].address).toEqual(dummyWallet.address);
    });
    it('should return a existing wallet from wallet store', async () => {

        const spy = jest.spyOn(ConfigManagerCertPassphrase,'readPassphrase').mockImplementation(() => PASSPHRASE);

        const wallet = await cosmosBase.getWallet(dummyWallet.address,'cosmos');
        
        expect(spy).toHaveBeenCalled();

        expect(wallet).toBeDefined();
        expect(wallet).not.toBeNull();

        const account = await wallet.getAccounts();

        expect(account[0].address).toEqual(dummyWallet.address);

        spy.mockRestore()
    }
    );
    it('should return a error when wallet is not present in keystore', async () => {

        await expect(cosmosBase.getWallet('cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5','cosmos')).rejects.toThrow('Wallet not found');

    });
  });

  describe('getBalances', () => {
    it('should return balances', async () => {
        await cosmosBase.init();
        expect(cosmosBase.ready()).toBe(true);

        const wallet = await cosmosBase.getWalletFromMnemonic(dummyWallet.mnemonic,'cosmos');
        const balances = await cosmosBase.getBalances(wallet);
        
        expect(Object.keys(balances).length).not.toBe(0);

        const keys = Object.keys(balances) as (keyof {
            [key:string]: string            
        })[];
        
        expect(keys[0]).toEqual('ATOM');
      });  
  });
  
  describe('getTransaction', () => {
    let spy: jest.SpyInstance;

    beforeEach(async () => {
      await cosmosBase.init();
      
      spy = jest.spyOn(cosmosBase, 'provider');

      cosmosBase.cache.flushAll();

    });
    it('should return a transaction from the given hash', async () => {

      const tx = await cosmosBase.getTransaction(testnetTxMetadata.hash) as IndexedTx;

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);


      expect(testnetTxMetadata.hash).toEqual(tx.hash);
      expect(testnetTxMetadata.height).toEqual(tx.height);
      expect(testnetTxMetadata.code).toEqual(tx.code);
      expect(testnetTxMetadata.gasUsed).toEqual(tx.gasUsed);
      expect(testnetTxMetadata.gasWanted).toEqual(tx.gasWanted);

      spy.mockRestore();
    });
    it('should store transaction at cache', async () => {
      
      const tx = await cosmosBase.getTransaction(testnetTxMetadata.hash) as IndexedTx;

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);

      const cachedTx = cosmosBase.retrieveTransaction(testnetTxMetadata.hash) as IndexedTx;

      expect(cachedTx).toBeDefined();
      expect(cachedTx).not.toBeNull();

      expect(tx).toEqual(cachedTx);

      spy.mockRestore();
    });
    it('should return error if transaction is not found', async () => {
      await expect(cosmosBase.getTransaction('9AD9F104637589373EBD351506F6C8E455FB01946ECC981BA3B10220A8953111')).rejects.toThrow('Transaction not found');
    });
    it('should return TransactionStatus.Success if transaction was successful', async () => {
      const statusMessage = await cosmosBase.getTransactionStatus(testnetTxMetadata.hash);

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);

      expect(statusMessage).toEqual(TransactionStatus.Success);
    });
  });

  describe('getChainId', () => {
    it('should return correct chain id', async () => {
      await cosmosBase.init();

      expect(await cosmosBase.getChainId()).toEqual(NETWORK.chainId);
    });
  });
});