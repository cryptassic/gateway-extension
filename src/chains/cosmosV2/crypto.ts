const crypto = require('crypto').webcrypto;
const { toBase64, fromHex } = require('@cosmjs/encoding');
const { DirectSecp256k1Wallet } = require('@cosmjs/proto-signing');

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { CosmosWallet, EncryptedPrivateKey } from "./types";



export class Crypto {
    protected async getWalletFromPrivateKey(
        privateKey: string,
        prefix: string
      ): Promise<CosmosWallet> {
        const wallet = await DirectSecp256k1Wallet.fromKey(
          fromHex(privateKey),
          prefix
        );
    
        return wallet;
    }

    protected async getWalletFromMnemonic(
        mnemonic: string,
        prefix: string
      ): Promise<CosmosWallet> {
    
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
          mnemonic,
          { prefix: prefix }
        ) as any;
    
        return wallet;
    }

    protected async encrypt(privateKey: string, password: string): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const keyMaterial = await this.getKeyMaterial(password);
        const keyAlgorithm = {
          name: 'PBKDF2',
          salt: salt,
          iterations: 500000,
          hash: 'SHA-256',
        };
        const key = await this.getKey(keyAlgorithm, keyMaterial);
        const cipherAlgorithm = {
          name: 'AES-GCM',
          iv: iv,
        };
        const enc = new TextEncoder();
        const ciphertext: Uint8Array = (await crypto.subtle.encrypt(
          cipherAlgorithm,
          key,
          enc.encode(privateKey)
        )) as Uint8Array;
        return JSON.stringify(
          {
            keyAlgorithm,
            cipherAlgorithm,
            ciphertext: new Uint8Array(ciphertext),
          },
          (key, value) => {
            switch (key) {
              case 'ciphertext':
              case 'salt':
              case 'iv':
                return toBase64(Uint8Array.from(Object.values(value)));
              default:
                return value;
            }
          }
        );
    }
    protected async decrypt(
        encryptedPrivateKey: EncryptedPrivateKey,
        password: string,
        prefix: string
      ): Promise<CosmosWallet> {
        const keyMaterial = await this.getKeyMaterial(password);
        const key = await this.getKey(
          encryptedPrivateKey.keyAlgorithm,
          keyMaterial
        );
        const decrypted = await crypto.subtle.decrypt(
          encryptedPrivateKey.cipherAlgorithm,
          key,
          encryptedPrivateKey.ciphertext
        );
        const dec = new TextDecoder();
        dec.decode(decrypted);
    
        return await this.getWalletFromPrivateKey(dec.decode(decrypted), prefix);
    }


    protected async getKeyMaterial(password: string) {
        const enc = new TextEncoder();
        return await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
        );
    }

    protected async getKey(
        keyAlgorithm: {
          salt: Uint8Array;
          name: string;
          iterations: number;
          hash: string;
        },
        keyMaterial: CryptoKey
      ) {
        return await crypto.subtle.deriveKey(
          keyAlgorithm,
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
    }
}


