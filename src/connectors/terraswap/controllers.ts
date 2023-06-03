import { TerraSwapish } from '../../services/common-interfaces';
import { HttpException } from '../../services/error-handler';
import { UNKNOWN_ERROR_ERROR_CODE } from '../../services/error-handler';

import { PairInfo } from '../connectors.base';

export async function pairs(terraswapish: TerraSwapish): Promise<PairInfo[]> {
  const pairs = await terraswapish.pairs();

  if (!pairs) {
    throw new HttpException(
      500,
      'Failed to get pairs',
      UNKNOWN_ERROR_ERROR_CODE
    );
  }

  return pairs;
}
