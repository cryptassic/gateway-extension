import { PairsRequest } from '../chains/cosmosV2/dex/dex.requests';
import { HttpException } from '../services/error-handler';
import { UNKNOWN_ERROR_ERROR_CODE } from '../services/error-handler';

import { AbstractSwapConnector, PairInfo } from './connectors.base';

export async function pairs(
  connector: AbstractSwapConnector,
  req: PairsRequest
): Promise<PairInfo[]> {
  const pairs = await connector.pairs(req.limit, req.start_after);

  if (!pairs) {
    throw new HttpException(
      500,
      'Failed to get pairs',
      UNKNOWN_ERROR_ERROR_CODE
    );
  }

  return pairs;
}
