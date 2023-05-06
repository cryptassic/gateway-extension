import { ConfigManagerV2 } from '../../services/config-manager-v2';
import { AvailableNetworks } from '../../services/config-manager-types';
export namespace WhiteWhaleConfig {
  export interface NetworkConfig {
    allowedSlippage: string;
    gasLimitEstimate: number;
    ttl: number;
    maximumHops: number;
    routerAddress: (chain:string,network: string) => string;
    factoryAddress: (chain:string,network: string) => string;
    tradingTypes: (type: string) => Array<string>;
    availableNetworks: Array<AvailableNetworks>;
  }

  export const config: NetworkConfig = {
    allowedSlippage: ConfigManagerV2.getInstance().get(
      `whitewhale.allowedSlippage`
    ),
    gasLimitEstimate: ConfigManagerV2.getInstance().get(
      `whitewhale.gasLimitEstimate`
    ),
    ttl: ConfigManagerV2.getInstance().get(`whitewhale.ttl`),
    maximumHops: ConfigManagerV2.getInstance().get(`whitewhale.maximumHops`),
    routerAddress: (chain:string,network: string) =>
      ConfigManagerV2.getInstance().get(
        `whitewhale.contractAddresses.${chain}.${network}.routerAddress`
      ),
    factoryAddress: (chain:string,network: string) =>
      ConfigManagerV2.getInstance().get(
        `whitewhale.contractAddresses.${chain}.${network}.factoryAddress`
      ),
    tradingTypes: () => ['COSMOS_AMM'],
    availableNetworks: [
      {
        chain: 'terra',
        networks: Object.keys(
          ConfigManagerV2.getInstance().get('terra.networks')
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
