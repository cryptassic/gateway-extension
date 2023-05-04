import { CosmosV2 } from './cosmos';
import { NextFunction, Request, Response } from 'express';
import { isValidChain, isValidNetwork } from './cosmos.validators';
// import { CosmosConfig } from './cosmos.config';



export const verifyCosmosIsAvailable = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  const cosmos = CosmosV2.getInstance(_req.body.chain,_req.body.network);
  if (!cosmos.ready()) {
    await cosmos.init();
  }
  return next();
};

export const verifyRequestParams = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  if(!isValidChain(_req.body.chain)){
    return next(new Error('Invalid chain'));
  }
  if(!isValidNetwork(_req.body.network)){
    return next(new Error('Invalid network'));
  }

  return next();
};

