/**
 * KeyAlgorithm interface describes the key derivation function parameters used for encryption
 *
 * @interface KeyAlgorithm
 * @property {string} name - The name of the key derivation function
 * @property {Uint8Array} salt - The salt used for the key derivation function
 * @property {number} iterations - The number of iterations used for the key derivation function
 * @property {string} hash - The hash function used for the key derivation function
 */
export interface KeyAlgorithm {
  name: string;
  salt: Uint8Array;
  iterations: number;
  hash: string;
}

/**
 * CipherAlgorithm interface describes the symmetric encryption algorithm parameters used for encryption
 *
 * @interface CipherAlgorithm
 * @property {string} name - The name of the symmetric encryption algorithm
 * @property {Uint8Array} iv - The initialization vector used for the symmetric encryption algorithm
 */
export interface CipherAlgorithm {
  name: string;
  iv: Uint8Array;
}

/**
 * EncryptedPrivateKey interface describes the structure of the encrypted private key object
 *
 * @interface EncryptedPrivateKey
 * @property {KeyAlgorithm} keyAlgorithm - The key derivation function parameters used for encryption
 * @property {CipherAlgorithm} cipherAlgorithm - The symmetric encryption algorithm parameters used for encryption
 * @property {Uint8Array} ciphertext - The ciphertext obtained after encryption
 */
export interface EncryptedPrivateKey {
  keyAlgorithm: KeyAlgorithm;
  cipherAlgorithm: CipherAlgorithm;
  ciphertext: Uint8Array;
}
