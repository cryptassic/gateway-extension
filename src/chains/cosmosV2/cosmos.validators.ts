import {
  validateTokenSymbols,
  mkValidator,
  mkRequestValidator,
  RequestValidator,
  Validator,
  validateTxHash,
} from '../../services/validators';
import { normalizeBech32 } from '@cosmjs/encoding';
import { SupportedChains } from './types';
import { Request } from 'express';

export const invalidCosmosAddressError: string =
  'The spender param is not a valid Cosmos address. (Bech32 format)';

export const isValidCosmosAddress = (str: string): boolean => {
  try {
    normalizeBech32(str);

    return true;
  } catch (e) {
    return false;
  }
};

export const isValidCosmosNetwork = (network: string): boolean => {
  return network === 'mainnet' || network === 'testnet';
}

// given a request, look for a key called address that is a Cosmos address
export const validatePublicKey: Validator = mkValidator(
  'address',
  invalidCosmosAddressError,
  (val) => typeof val === 'string' && isValidCosmosAddress(val)
);

export const validateCosmosBalanceRequest: RequestValidator =
  mkRequestValidator([validatePublicKey, validateTokenSymbols]);

export const validateCosmosPollRequest: RequestValidator = mkRequestValidator([
  validateTxHash,
]);

export const isValidChain = (chain: string): boolean => {
  return SupportedChains.includes(chain);
};

export const isValidNetwork = (network: string): boolean => {
  return network === 'mainnet' || network === 'testnet';
};

export function isValidRequestParams(_req: Request): boolean {
  if (!isValidChain(_req.body.chain)) {
    return false;
  }
  if (!isValidNetwork(_req.body.network)) {
    return false;
  }

  return true;
}
