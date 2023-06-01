/* eslint-disable @typescript-eslint/ban-types */
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../../services/error-handler';
import {
  verifyCosmosIsAvailable,
  verifyRequestParams,
} from '../cosmos-middlewares';

import { pairs } from './dex.controllers';
import { PairsRequest, PairsResponse } from './dex.requests';
import { validatePairsRequest } from './dex.validators';

export namespace DEXRoutes {
  export const router = Router();

  router.use(asyncHandler(verifyRequestParams));
  router.use(asyncHandler(verifyCosmosIsAvailable));

  router.post(
    '/pairs',
    asyncHandler(
      async (
        // eslint-disable-next-line @typescript-eslint/ban-types
        req: Request<{}, {}, PairsRequest>,
        res: Response<PairsResponse | string, {}>
      ) => {
        validatePairsRequest(req.body);
        res.status(200).json(await pairs(req.body));
      }
    )
  );
}
