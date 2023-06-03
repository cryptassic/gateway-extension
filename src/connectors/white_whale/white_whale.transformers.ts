import {
  IBCMap,
  getIBCMap,
  getTokenMetadata,
  TokenMetadataMap,
} from '../../services/data-provider';
import { logger } from '../../services/logger';
import { isStringProperty } from '../../services/base';
import { Asset, LiquidityToken } from '../../chains/cosmosV2/types';

import { PairInfo as OutputPairInfo } from '../connectors.base';
import { ClientsManager } from '../connectors.clients';

import { PairInfo as InputPairInfo } from './types';

import { getTokenMetadataIndex, getTokenValue } from './white_whale.helpers';

abstract class BaseTransformer {
  private readonly _clientsManager: ClientsManager;
  private _ibcTokenMap: IBCMap | undefined;
  private _tokenMetadata: TokenMetadataMap | undefined;

  public get ready(): boolean {
    const ibcTokenMapSize = this._ibcTokenMap?.size || 0;
    const tokenMetadataMapSize = this._tokenMetadata?.size || 0;

    const hasNonEmptyIbcTokenMap = ibcTokenMapSize > 0;
    const hasNonEmptyTokenMetadataMap = tokenMetadataMapSize > 0;

    if (hasNonEmptyIbcTokenMap && hasNonEmptyTokenMetadataMap) {
      return true;
    } else {
      logger.debug(
        `IBC Token Map or TokenMetadata is empty. [IBC:${ibcTokenMapSize} tokens | Metadata:${tokenMetadataMapSize}}]`
      );
      return false;
    }
  }
  protected get clientsManager(): ClientsManager {
    return this._clientsManager;
  }
  protected get ibcTokenMap(): IBCMap | undefined {
    return this._ibcTokenMap;
  }
  protected get tokenMetadata(): TokenMetadataMap | undefined {
    return this._tokenMetadata;
  }

  constructor() {
    this._clientsManager = ClientsManager.getInstance();
  }
  public async init(): Promise<void> {
    await this._initIBCMap();
    await this._initTokenMetadata();
  }
  // We need IBC mapping to resolve assets found in pools. This allows us to append more information
  // to each asset.
  protected async _initIBCMap(): Promise<void> {
    const ibcMap = await getIBCMap();

    if (!ibcMap || ibcMap.size === 0) {
      throw new Error('Unable to get IBC Token Map');
    }

    this._ibcTokenMap = ibcMap;
  }
  // We use tokens metadata to further augment the information returned to the user.
  // It goes together with IBC Maps.
  protected async _initTokenMetadata(): Promise<void> {
    const tokenMetadata = await getTokenMetadata();

    if (!tokenMetadata || tokenMetadata.size === 0) {
      throw new Error('Unable to get Token Metadata');
    }

    this._tokenMetadata = tokenMetadata;
  }
}

export class PairDataTransformer extends BaseTransformer {
  private static instance: PairDataTransformer;

  private constructor() {
    super();
  }
  public static getInstance(): PairDataTransformer {
    if (!PairDataTransformer.instance) {
      PairDataTransformer.instance = new PairDataTransformer();
    }
    return PairDataTransformer.instance;
  }
  public async transform(
    data: InputPairInfo[],
    chain: string
  ): Promise<OutputPairInfo[]> {
    if (!this.ready) {
      await this.init();
    }

    if (!this.ibcTokenMap) {
      throw new Error('IBC Token Map not initialized');
    }
    if (!this.tokenMetadata) {
      throw new Error('TokenMetadata not initialized');
    }

    const transformedData = data
      .map((pairInfo: InputPairInfo): OutputPairInfo | null => {
        try {
          // Index used to search for token metadata.
          const index1 = this.getIndex(pairInfo, 0, chain);
          const index2 = this.getIndex(pairInfo, 1, chain);
          const indexLP = this.getTokenAddress(pairInfo) + '_' + chain;

          // Search for assets to be used as metadata for our data augmentation.
          const asset1 = this.tokenMetadata?.get(index1 as string) as Asset;
          const asset2 = this.tokenMetadata?.get(index2 as string) as Asset;
          const assetLP = this.tokenMetadata?.get(
            indexLP as string
          ) as LiquidityToken;

          // We need valid assets to be able to extend properties.
          if (!asset1 || !asset2 || !assetLP) {
            logger.error(
              `Pair: ${pairInfo.contract_addr} - Failed to get Token Metadata for any of these [${index1},${index2},${assetLP}]`
            );
            return null;
          }

          // Our transformed object
          return {
            asset_infos: [asset1, asset2],
            symbol: `${asset1?.symbol}-${asset2?.symbol}`,
            contract_addr: pairInfo.contract_addr,
            liquidity_token: assetLP,
            pair_type: pairInfo.pair_type,
          };
        } catch (error) {
          logger.error(
            `Error ${error} getting Pairs Token Info: ${pairInfo.asset_infos[0]} - ${pairInfo.asset_infos[1]}`
          );

          return null;
        }
      })
      .filter((value) => value !== null) as OutputPairInfo[];

    return transformedData;
  }
  private getIndex(
    pairInfo: InputPairInfo,
    position: number,
    chain: string
  ): string | undefined {
    return getTokenMetadataIndex(
      pairInfo.asset_infos[position],
      this.ibcTokenMap as IBCMap,
      chain
    );
  }
  private getTokenAddress(pairInfo: InputPairInfo): string {
    let lpTokenAddress;
    if (isStringProperty(pairInfo, 'liquidity_token')) {
      // TODO(cryptassic): Check why this strange behavior.
      lpTokenAddress = pairInfo.liquidity_token as any;
    } else {
      lpTokenAddress = getTokenValue(pairInfo.liquidity_token);
    }
    return lpTokenAddress;
  }
}
