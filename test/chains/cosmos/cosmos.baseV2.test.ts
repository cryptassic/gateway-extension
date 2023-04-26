import NodeCache from 'node-cache';
import {CosmosBaseV2, Asset} from '../../../src/chains/cosmos/cosmos-baseV2';
import { TokenListType } from '../../../src/services/base';


const mockAsset: Asset =  {
    description: "The native staking and governance token of the Cosmos Hub.",
    denom_units: [
      {
        denom: "uatom",
        exponent: 0,
      },
      {
        denom: "atom",
        exponent: 6,
      },
    ],
    base: "uatom",
    name: "Cosmos Hub Atom",
    display: "atom",
    symbol: "ATOM",
    logo_URIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
    },
    coingecko_id: "cosmos",
  };



describe('CosmosBase', () => {
    const chainName = 'cosmoshub-4';
    const rpcUrl = 'https://cosmos-rpc.polkachu.com/';
    const gasPriceConstant = 0.025;
    const tokenListSource = 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/assetlist.json';
    const tokenListType: TokenListType = 'URL';
  
    let cosmosBase: CosmosBaseV2;
  
    beforeEach(() => {
        cosmosBase = new CosmosBaseV2(chainName, rpcUrl, tokenListSource, tokenListType, gasPriceConstant);
    });

    describe('constructor', () => {
        it('should set chainName', () => {
          expect(cosmosBase.chainName).toEqual(chainName);
        });
    
        it('should set rpcUrl', () => {
          expect(cosmosBase.rpcUrl).toEqual(rpcUrl);
        });
    
        it('should set gasPriceConstant', () => {
          expect(cosmosBase.gasPriceConstant).toEqual(gasPriceConstant);
        });
    
        it('should set tokenListSource', () => {
          expect(cosmosBase.tokenListSource).toEqual(
            'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/assetlist.json'
          );
        });
    
        it('should set tokenListType', () => {
          expect(cosmosBase.tokenListType).toEqual('URL');
        });
    
        it('should create a new NodeCache object', () => {
          expect(cosmosBase.cache).toBeInstanceOf(NodeCache);
        });
      });    

    describe('init', () => {
      it('should load tokens and set _ready flag to true', async () => {
        await cosmosBase.init();
        expect(cosmosBase.ready()).toBeTruthy();
        expect(cosmosBase.storedAssetList.length).toBeGreaterThan(0);
      });
  
      it('should not load tokens again when called multiple times', async () => {
        await cosmosBase.init();
        const assetList = cosmosBase.storedAssetList;
        await cosmosBase.init();
        expect(cosmosBase.storedAssetList).toEqual(assetList);
      });
    });
  
    describe('Assets', () => {
        describe('getAssetForSymbol', () => {
            it('should return Asset object for symbol', async () => {
              await cosmosBase.init();

              expect(cosmosBase.storedAssetList.length).toBeGreaterThan(0);

              const symbol = 'atom';
              const asset = cosmosBase.getAssetForSymbol(symbol);

              expect(asset).toBeDefined();
              expect(asset).not.toBeNull();
              expect(asset?.symbol).toEqual(symbol.toUpperCase());
            });
        
            it('should return null if asset symbol is not found', async () => {
              await cosmosBase.init();
              const symbol = 'xyz';
              const asset = cosmosBase.getAssetForSymbol(symbol);

              expect(asset).toBeNull();
            });
        });
        describe('getAssetDecimals', () => {
            it('should return number 6 for given asset', async () => {
                await cosmosBase.init();
    
                expect(cosmosBase.storedAssetList.length).toBeGreaterThan(0);
                
                const assetDecimals = cosmosBase.getAssetDecimals(mockAsset);
                
                expect(assetDecimals).toEqual(6);
                });
        });
        
        describe('getAssetByBase', () => {
            it('should return correct asset given base', async () => {
                await cosmosBase.init();
    
                expect(cosmosBase.storedAssetList.length).toBeGreaterThan(0);
                
                const asset = cosmosBase.getAssetByBase('uatom');

                expect(asset).toBeDefined();
                expect(asset).not.toBeNull();
                
                expect(asset?.symbol).toEqual('ATOM');
                });
        }); 

        describe('getAssetBySymbol', () => {
            it('should return correct asset given symbol', async () => {
                await cosmosBase.init();
    
                expect(cosmosBase.storedAssetList.length).toBeGreaterThan(0);
                
                const asset = cosmosBase.getAssetBySymbol('atom');

                expect(asset).toBeDefined();
                expect(asset).not.toBeNull();
                
                expect(asset?.symbol).toEqual('ATOM');
                });
        });


    });

    describe('Cache', () => {
      describe('cacheTransactionReceipt', () => {
          it.todo('should cache transaction receipt');
          
      });
      describe('getTransactionReceipt', () => {
          it.todo('should cache transaction receipt');
      });

    });

    describe('txStorage', () => {
      
      describe('getTxStorage', () => {
          it.todo('should return tx storage');
      });
    });

    describe('getWalletFromPrivateKey', () => {
      it.skip('should create a wallet from a private key', async () => {
        const prefix = 'cosmos';
        const privateKey = '5449ebd32a54b3d963d57f53c3fbc2f743d2994e0b2aa2e4cc9a4d6475b5ef32';
        const wallet = await cosmosBase.getWalletFromPrivateKey(privateKey, prefix);
        expect(wallet).toBeDefined();
        // expect(wallet.address).toMatch(/^cosmos[a-z0-9]{38}$/);
      });
    });
  
    describe('getWalletFromMnemonic', () => {
      it.skip('should create a wallet from a mnemonic', async () => {
        const prefix = 'cosmos';
        const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        const wallet = await cosmosBase.getWalletFromMnemonic(mnemonic, prefix);
        expect(wallet).toBeDefined();
        expect(wallet.address).toMatch(/^cosmos[a-z0-9]{38}$/);
      });
    });
  
    describe('getAccountsfromPrivateKey', () => {
      it.skip('should return AccountData object from private key', async () => {
        const prefix = 'cosmos';
        const privateKey = '5449ebd32a54b3d963d57f53c3fbc2f743d2994e0b2aa2e4cc9a4d6475b5ef32';
        const account = await cosmosBase.getAccountsfromPrivateKey(privateKey, prefix);
        expect(account).toBeDefined();
      });
    });
});