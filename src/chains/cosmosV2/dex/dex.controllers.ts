import { PairsRequest, PairsResponse } from './dex.requests';
import { TerraSwapish } from '../../../services/common-interfaces';

import { latency } from '../../../services/base';
import { getConnector } from '../../../services/connection-manager';
import { pairs as terraPairs } from '../../../connectors/terraswap/controllers';
import {
  HttpException,
  UNKNOWN_ERROR_ERROR_CODE,
} from '../../../services/error-handler';

export async function pairs(req: PairsRequest): Promise<PairsResponse> {
  const initTime = Date.now();

  let connector: TerraSwapish;

  try {
    connector = await getConnector<TerraSwapish>(
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
  const pairs = await terraPairs(connector);
  return {
    latency: latency(initTime, Date.now()),
    pairs: pairs,
  };
}
