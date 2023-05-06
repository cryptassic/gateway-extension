
import { 
    RequestValidator,
    mkRequestValidator, 
    Validator, 
    mkValidator 
} from '../../../services/validators';


export const invalidPairLimitError: string =
  'The limit param is not valid. (Must be a number) and no more than 30';


export const validateLimit: Validator = mkValidator(
    'limit',
    invalidPairLimitError,
    (val) => val === undefined || typeof val === 'number' && val <= 30
);
  

export const validatePairsRequest: RequestValidator = mkRequestValidator([
    validateLimit
]);