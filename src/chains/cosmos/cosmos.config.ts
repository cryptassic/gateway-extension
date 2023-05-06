import { TokenListType } from '../../services/base';
import { ConfigManagerV2 } from '../../services/config-manager-v2';

export enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}
export interface NetworkConfig {
  name: string;
  rpcURL: string;
  tokenListType: TokenListType;
  tokenListSource: string;
}

export interface NetworkConfigV2 {
  name: string;
  nodeURL: string;
  tokenListType: TokenListType;
  tokenListSource: string;
  chainId: string;
  bech32Prefix: string;
}

export interface Config {
  network: NetworkConfig;
  nativeCurrencySymbol: string;
  manualGasPrice: number;
}

export interface ConfigV2 {
  network: NetworkConfigV2;
  nativeCurrencySymbol: string;
  manualGasPrice: number;
}

export namespace CosmosConfig {
  export const config: Config = getCosmosConfig('cosmos');
}

export namespace CosmosConfigV2 {
  export const config: ConfigV2 = getCosmosConfigV2('cosmos', Network.Mainnet);
}

export function getCosmosConfigV2(
  chainName: string,
  network: string
): ConfigV2 {
  const configManager = ConfigManagerV2.getInstance();
  return {
    network: {
      name: network,
      nodeURL: configManager.get(
        chainName + '.networks.' + network + '.nodeURL'
      ),
      tokenListType: configManager.get(
        chainName + '.networks.' + network + '.tokenListType'
      ),
      tokenListSource: configManager.get(
        chainName + '.networks.' + network + '.tokenListSource'
      ),
      chainId: configManager.get(
        chainName + '.networks.' + network + '.chainId'
      ),
      bech32Prefix: configManager.get(
        chainName + '.networks.' + network + '.bech32Prefix'
      ),
    },
    nativeCurrencySymbol: configManager.get(
      chainName + '.nativeCurrencySymbol'
    ),
    manualGasPrice: configManager.get(chainName + '.manualGasPrice'),
  };
}

export function getCosmosConfig(chainName: string): Config {
  const configManager = ConfigManagerV2.getInstance();
  const network = configManager.get(chainName + '.network');
  return {
    network: {
      name: network,
      rpcURL: configManager.get(chainName + '.networks.' + network + '.rpcURL'),
      tokenListType: configManager.get(
        chainName + '.networks.' + network + '.tokenListType'
      ),
      tokenListSource: configManager.get(
        chainName + '.networks.' + network + '.tokenListSource'
      ),
    },
    nativeCurrencySymbol: configManager.get(
      chainName + '.nativeCurrencySymbol'
    ),
    manualGasPrice: configManager.get(chainName + '.manualGasPrice'),
  };
}
