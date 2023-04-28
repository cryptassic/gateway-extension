import { ConfigManagerV2 } from '../../services/config-manager-v2';
import { AvailableNetworks } from '../../services/config-manager-types';
export namespace TerraswapConfig {
  export interface NetworkConfig {
    allowedSlippage: string;
    gasLimitEstimate: number;
    ttl: number;
    maximumHops: number;
    terraswapRouterAddress: (network: string) => string;
    terraswapFactoryAddress: (network: string) => string;
    tradingTypes: (type: string) => Array<string>;
    availableNetworks: Array<AvailableNetworks>;
  }

  export const config: NetworkConfig = {
    allowedSlippage: ConfigManagerV2.getInstance().get(
      `terraswap.allowedSlippage`
    ),
    gasLimitEstimate: ConfigManagerV2.getInstance().get(
      `terraswap.gasLimitEstimate`
    ),
    ttl: ConfigManagerV2.getInstance().get(`terraswap.ttl`),
    maximumHops: ConfigManagerV2.getInstance().get(`terraswap.maximumHops`),
    terraswapRouterAddress: (network: string) =>
      ConfigManagerV2.getInstance().get(
        `terraswap.contractAddresses.${network}.terraswapRouterAddress`
      ),
    terraswapFactoryAddress: (network: string) =>
      ConfigManagerV2.getInstance().get(
        `terraswap.contractAddresses.${network}.terraswapFactoryAddress`
      ),
    tradingTypes: () => ['COSMOS_AMM'], // Not really sure what this is for lol
    availableNetworks: [
      {
        chain: 'terra',
        networks: Object.keys(
          ConfigManagerV2.getInstance().get('terraswap.contractAddresses')
        ).filter((network) =>
          Object.keys(
            ConfigManagerV2.getInstance().get('terra2.networks')
          ).includes(network)
        ),
      },
      // {
      //   chain: 'juno',
      //   networks: Object.keys(
      //     ConfigManagerV2.getInstance().get('terraswap.contractAddresses')
      //   ).filter((network) =>
      //     Object.keys(
      //       ConfigManagerV2.getInstance().get('juno.networks')
      //     ).includes(network)
      //   ),
      // },
      // {
      //   chain: 'chihuaua',
      //   networks: Object.keys(
      //     ConfigManagerV2.getInstance().get('terraswap.contractAddresses')
      //   ).filter((network) =>
      //     Object.keys(
      //       ConfigManagerV2.getInstance().get('chihuaua.networks')
      //     ).includes(network)
      //   ),
      // },
    ],
  };
}
