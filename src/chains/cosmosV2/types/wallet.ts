import { AccountData, DirectSignResponse } from '@cosmjs/proto-signing';

/**
* Interface representing a Cosmos wallet.
  * @interface CosmosWallet
  * @property {Uint8Array} privKey - Private key.
  * @property {Uint8Array} pubkey - Public key.
  * @property {string} prefix - Address prefix.
  * @function getAccounts - Function returning an array of {@link AccountData}.
  * @function signDirect - Function returning a {@link DirectSignResponse}.
  * @function fromKey - Function returning a new instance of {@link CosmosWallet}.
*/
export interface CosmosWallet {
    privKey: Uint8Array;
    pubkey: Uint8Array;
    prefix: 'string';
    getAccounts(): [AccountData];
    signDirect(): DirectSignResponse;
    fromKey(): CosmosWallet;
}