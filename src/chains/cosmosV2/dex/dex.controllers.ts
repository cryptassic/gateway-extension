import { latency } from '../../../services/base';
import { getConnector } from '../../../services/connection-manager';
import { pairs as getPairs } from '../../../connectors/connectors.controllers';
import { AbstractSwapConnector } from '../../../connectors/connectors.base';
import {
  HttpException,
  UNKNOWN_ERROR_ERROR_CODE,
} from '../../../services/error-handler';

import { PairsRequest, PairsResponse } from './dex.requests';

export async function pairs(req: PairsRequest): Promise<PairsResponse> {
  const initTime = Date.now();

  let connector: AbstractSwapConnector;

  try {
    connector = await getConnector<AbstractSwapConnector>(
      req.chain,
      req.network,
      req.connector
    );
  } catch (error) {
    throw new HttpException(
      500,
      `Failed to get connector for chain ${req.chain} and network ${req.network}. Make sure that the connector + chain exists.`,
      UNKNOWN_ERROR_ERROR_CODE
    );
  }
  const pairs = await getPairs(connector, req);
  return {
    latency: latency(initTime, Date.now()),
    pairs: pairs,
  };
}
