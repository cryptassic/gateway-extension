/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.27.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { Coin, StdFee } from '@cosmjs/amino'
import {
  InstantiateMsg,
  ExecuteMsg,
  Uint128,
  Binary,
  SwapOperation,
  AssetInfo,
  Cw20ReceiveMsg,
  SwapRoute,
  QueryMsg,
  MigrateMsg,
  ConfigResponse,
  SimulateSwapOperationsResponse,
  ArrayOfSwapOperation,
} from './TerraswapRouter.types'
export interface TerraswapRouterReadOnlyInterface {
  contractAddress: string
  config: () => Promise<ConfigResponse>
  simulateSwapOperations: ({
    offerAmount,
    operations,
  }: {
    offerAmount: Uint128
    operations: SwapOperation[]
  }) => Promise<SimulateSwapOperationsResponse>
  reverseSimulateSwapOperations: ({
    askAmount,
    operations,
  }: {
    askAmount: Uint128
    operations: SwapOperation[]
  }) => Promise<SimulateSwapOperationsResponse>
  swapRoute: ({
    askAssetInfo,
    offerAssetInfo,
  }: {
    askAssetInfo: AssetInfo
    offerAssetInfo: AssetInfo
  }) => Promise<ArrayOfSwapOperation>
}
export class TerraswapRouterQueryClient implements TerraswapRouterReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.config = this.config.bind(this)
    this.simulateSwapOperations = this.simulateSwapOperations.bind(this)
    this.reverseSimulateSwapOperations = this.reverseSimulateSwapOperations.bind(this)
    this.swapRoute = this.swapRoute.bind(this)
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {},
    })
  }
  simulateSwapOperations = async ({
    offerAmount,
    operations,
  }: {
    offerAmount: Uint128
    operations: SwapOperation[]
  }): Promise<SimulateSwapOperationsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      simulate_swap_operations: {
        offer_amount: offerAmount,
        operations,
      },
    })
  }
  reverseSimulateSwapOperations = async ({
    askAmount,
    operations,
  }: {
    askAmount: Uint128
    operations: SwapOperation[]
  }): Promise<SimulateSwapOperationsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      reverse_simulate_swap_operations: {
        ask_amount: askAmount,
        operations,
      },
    })
  }
  swapRoute = async ({
    askAssetInfo,
    offerAssetInfo,
  }: {
    askAssetInfo: AssetInfo
    offerAssetInfo: AssetInfo
  }): Promise<ArrayOfSwapOperation> => {
    return this.client.queryContractSmart(this.contractAddress, {
      swap_route: {
        ask_asset_info: askAssetInfo,
        offer_asset_info: offerAssetInfo,
      },
    })
  }
}
export interface TerraswapRouterInterface extends TerraswapRouterReadOnlyInterface {
  contractAddress: string
  sender: string
  receive: (
    {
      amount,
      msg,
      sender,
    }: {
      amount: Uint128
      msg: Binary
      sender: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    funds?: Coin[]
  ) => Promise<ExecuteResult>
  executeSwapOperations: (
    {
      minimumReceive,
      operations,
      to,
    }: {
      minimumReceive?: Uint128
      operations: SwapOperation[]
      to?: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    funds?: Coin[]
  ) => Promise<ExecuteResult>
  executeSwapOperation: (
    {
      operation,
      to,
    }: {
      operation: SwapOperation
      to?: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    funds?: Coin[]
  ) => Promise<ExecuteResult>
  assertMinimumReceive: (
    {
      assetInfo,
      minimumReceive,
      prevBalance,
      receiver,
    }: {
      assetInfo: AssetInfo
      minimumReceive: Uint128
      prevBalance: Uint128
      receiver: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    funds?: Coin[]
  ) => Promise<ExecuteResult>
  addSwapRoutes: (
    {
      swapRoutes,
    }: {
      swapRoutes: SwapRoute[]
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    funds?: Coin[]
  ) => Promise<ExecuteResult>
}
export class TerraswapRouterClient
  extends TerraswapRouterQueryClient
  implements TerraswapRouterInterface
{
  client: SigningCosmWasmClient
  sender: string
  contractAddress: string

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress)
    this.client = client
    this.sender = sender
    this.contractAddress = contractAddress
    this.receive = this.receive.bind(this)
    this.executeSwapOperations = this.executeSwapOperations.bind(this)
    this.executeSwapOperation = this.executeSwapOperation.bind(this)
    this.assertMinimumReceive = this.assertMinimumReceive.bind(this)
    this.addSwapRoutes = this.addSwapRoutes.bind(this)
  }

  receive = async (
    {
      amount,
      msg,
      sender,
    }: {
      amount: Uint128
      msg: Binary
      sender: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    funds?: Coin[]
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        receive: {
          amount,
          msg,
          sender,
        },
      },
      fee,
      memo,
      funds
    )
  }
  executeSwapOperations = async (
    {
      minimumReceive,
      operations,
      to,
    }: {
      minimumReceive?: Uint128
      operations: SwapOperation[]
      to?: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    funds?: Coin[]
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        execute_swap_operations: {
          minimum_receive: minimumReceive,
          operations,
          to,
        },
      },
      fee,
      memo,
      funds
    )
  }
  executeSwapOperation = async (
    {
      operation,
      to,
    }: {
      operation: SwapOperation
      to?: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    funds?: Coin[]
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        execute_swap_operation: {
          operation,
          to,
        },
      },
      fee,
      memo,
      funds
    )
  }
  assertMinimumReceive = async (
    {
      assetInfo,
      minimumReceive,
      prevBalance,
      receiver,
    }: {
      assetInfo: AssetInfo
      minimumReceive: Uint128
      prevBalance: Uint128
      receiver: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    funds?: Coin[]
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        assert_minimum_receive: {
          asset_info: assetInfo,
          minimum_receive: minimumReceive,
          prev_balance: prevBalance,
          receiver,
        },
      },
      fee,
      memo,
      funds
    )
  }
  addSwapRoutes = async (
    {
      swapRoutes,
    }: {
      swapRoutes: SwapRoute[]
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    funds?: Coin[]
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        add_swap_routes: {
          swap_routes: swapRoutes,
        },
      },
      fee,
      memo,
      funds
    )
  }
}
