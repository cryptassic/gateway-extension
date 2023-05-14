
import { PairsRequest, PairsResponse } from './dex.requests';
import { TerraSwapish } from '../../../services/common-interfaces';

import { latency } from '../../../services/base';
import { getConnector } from '../../../services/connection-manager';
import { pairs as terraPairs } from '../../../connectors/terraswap/controllers';

export async function pairs(req: PairsRequest): Promise<PairsResponse> {
  const initTime = Date.now();

  const connector: TerraSwapish = await getConnector<TerraSwapish>(
    req.chain,
    req.network,
    req.connector
  );

  const pairs = await terraPairs(connector);

  return {
    latency: latency(initTime, Date.now()),
    pairs: pairs
  }
}
