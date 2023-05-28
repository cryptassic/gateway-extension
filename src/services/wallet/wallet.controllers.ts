import fse from 'fs-extra';
import { Avalanche } from '../../chains/avalanche/avalanche';
import { BinanceSmartChain } from '../../chains/binance-smart-chain/binance-smart-chain';
import { Cronos } from '../../chains/cronos/cronos';
import { Ethereum } from '../../chains/ethereum/ethereum';
import { Polygon } from '../../chains/polygon/polygon';
import { Xdc } from '../../chains/xdc/xdc';
import { Cosmos } from '../../chains/cosmos/cosmos';
import { CosmosV2 } from '../../chains/cosmosV2/cosmos';
import { Harmony } from '../../chains/harmony/harmony';
import { Injective } from '../../chains/injective/injective';

import { SupportedChains } from '../../chains/cosmosV2/types';

import {
  AddWalletRequest,
  AddWalletResponse,
  RemoveWalletRequest,
  GetWalletResponse,
  WalletSignRequest,
  WalletSignResponse,
} from './wallet.requests';

import { isCosmosPrivateKey } from './wallet.validators';

import { ConfigManagerCertPassphrase } from '../config-manager-cert-passphrase';

import {
  ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_CODE,
  ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_MESSAGE,
  ACCOUNT_NOT_SPECIFIED_CODE,
  ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE,
  HttpException,
  UNKNOWN_CHAIN_ERROR_CODE,
  UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE,
} from '../error-handler';
import { EthereumBase } from '../../chains/ethereum/ethereum-base';
import { Near } from '../../chains/near/near';
import { getChain } from '../connection-manager';
import { Ethereumish } from '../common-interfaces';
import { Network } from '../../chains/cosmosV2/types';

export function convertXdcAddressToEthAddress(publicKey: string): string {
  return publicKey.length === 43 && publicKey.slice(0, 3) === 'xdc'
    ? '0x' + publicKey.slice(3)
    : publicKey;
}

const walletPath = './conf/wallets';
export async function mkdirIfDoesNotExist(path: string): Promise<void> {
  const exists = await fse.pathExists(path);
  if (!exists) {
    await fse.mkdir(path, { recursive: true });
  }
}

export async function addWallet(
  req: AddWalletRequest
): Promise<AddWalletResponse> {
  const passphrase = ConfigManagerCertPassphrase.readPassphrase();
  if (!passphrase) {
    throw new Error('There is no passphrase');
  }
  let connection: EthereumBase | Near | Cosmos | CosmosV2 | Injective | Xdc;
  let address: string | undefined;
  let encryptedPrivateKey: string | undefined;

  if (req.chain === 'ethereum') {
    connection = Ethereum.getInstance(req.network);
  } else if (req.chain === 'avalanche') {
    connection = Avalanche.getInstance(req.network);
  } else if (req.chain === 'harmony') {
    connection = Harmony.getInstance(req.network);
  } else if (req.chain === 'polygon') {
    connection = Polygon.getInstance(req.network);
  } else if (req.chain === 'cronos') {
    connection = Cronos.getInstance(req.network);
  } else if (req.chain === 'cosmos') {
    connection = Cosmos.getInstance(req.network);
  } else if (SupportedChains.includes(req.chain)) {
    connection = CosmosV2.getInstance(req.chain, Network.Mainnet);
  } else if (req.chain === 'near') {
    if (!('address' in req))
      throw new HttpException(
        500,
        ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE(),
        ACCOUNT_NOT_SPECIFIED_CODE
      );
    connection = Near.getInstance(req.network);
  } else if (req.chain === 'binance-smart-chain') {
    connection = BinanceSmartChain.getInstance(req.network);
  } else if (req.chain === 'xdc') {
    connection = Xdc.getInstance(req.network);
  } else if (req.chain === 'injective') {
    connection = Injective.getInstance(req.network);
  } else {
    throw new HttpException(
      500,
      UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE(req.chain),
      UNKNOWN_CHAIN_ERROR_CODE
    );
  }

  if (!connection.ready()) {
    await connection.init();
  }

  try {
    if (connection instanceof EthereumBase) {
      address = connection.getWalletFromPrivateKey(req.privateKey).address;
      encryptedPrivateKey = await connection.encrypt(
        req.privateKey,
        passphrase
      );
    } else if (connection instanceof Xdc) {
      address = convertXdcAddressToEthAddress(
        connection.getWalletFromPrivateKey(req.privateKey).address
      );
      encryptedPrivateKey = await connection.encrypt(
        req.privateKey,
        passphrase
      );
    } else if (connection instanceof Cosmos) {
      const fromPrivate = connection.getAccountsfromPrivateKey;
      const fromMnemonic = connection.getWalletFromMnemonic;

      const wallet = isCosmosPrivateKey(req.privateKey)
        ? await fromPrivate(req.privateKey, 'cosmos')
        : await fromMnemonic(req.privateKey, 'cosmos');

      address = wallet.address;

      encryptedPrivateKey = await connection.encrypt(
        req.privateKey,
        passphrase
      );
    } else if (connection instanceof CosmosV2) {
      const fromPrivate = connection.getWalletFromPrivateKey;
      const fromMnemonic = connection.getWalletFromMnemonic;

      const wallet = isCosmosPrivateKey(req.privateKey)
        ? await fromPrivate(req.privateKey, connection.bech32Prefix)
        : await fromMnemonic(req.privateKey, connection.bech32Prefix);

      const account = await wallet.getAccounts();

      address = account[0].address;

      encryptedPrivateKey = await connection.encrypt(
        req.privateKey,
        passphrase
      );
    } else if (connection instanceof Near) {
      address = (
        await connection.getWalletFromPrivateKey(
          req.privateKey,
          <string>req.address
        )
      ).accountId;
      encryptedPrivateKey = connection.encrypt(req.privateKey, passphrase);
    } else if (connection instanceof Injective) {
      const ethereumAddress = connection.getWalletFromPrivateKey(
        req.privateKey
      ).address;
      const subaccountId = req.accountId;
      if (subaccountId !== undefined) {
        address = ethereumAddress + subaccountId.toString(16).padStart(24, '0');

        encryptedPrivateKey = await connection.encrypt(
          req.privateKey,
          passphrase
        );
      } else {
        throw new Error('Injective wallet requires a subaccount id');
      }
    }

    if (address === undefined || encryptedPrivateKey === undefined) {
      throw new Error('ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_CODE');
    }
  } catch (_e: unknown) {
    throw new HttpException(
      500,
      ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_MESSAGE(req.privateKey),
      ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_CODE
    );
  }
  const path = `${walletPath}/${req.chain}`;
  await storeWallet(path, address, encryptedPrivateKey);
  return { address };
}

// if the file does not exist, this should not fail
export async function removeWallet(req: RemoveWalletRequest): Promise<void> {
  await fse.remove(`./conf/wallets/${req.chain}/${req.address}.json`);
}

export async function storeWallet(
  path: string,
  address: string,
  encryptedPrivateKey: string
): Promise<void> {
  await mkdirIfDoesNotExist(path);
  await fse.writeFile(`${path}/${address}.json`, encryptedPrivateKey);
}

export async function signMessage(
  req: WalletSignRequest
): Promise<WalletSignResponse> {
  const chain: Ethereumish = await getChain(req.chain, req.network);
  const wallet = await chain.getWallet(req.address);
  return { signature: await wallet.signMessage(req.message) };
}

export async function getDirectories(source: string): Promise<string[]> {
  await mkdirIfDoesNotExist(walletPath);
  const files = await fse.readdir(source, { withFileTypes: true });
  return files
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

export function getLastPath(path: string): string {
  return path.split('/').slice(-1)[0];
}

export function dropExtension(path: string): string {
  return path.substr(0, path.lastIndexOf('.')) || path;
}

export async function getJsonFiles(source: string): Promise<string[]> {
  const files = await fse.readdir(source, { withFileTypes: true });
  return files
    .filter((f) => f.isFile() && f.name.endsWith('.json'))
    .map((f) => f.name);
}

export async function getWallets(): Promise<GetWalletResponse[]> {
  const chains = await getDirectories(walletPath);

  const responses: GetWalletResponse[] = [];

  for (const chain of chains) {
    const walletFiles = await getJsonFiles(`${walletPath}/${chain}`);

    const response: GetWalletResponse = { chain, walletAddresses: [] };

    for (const walletFile of walletFiles) {
      const address = dropExtension(getLastPath(walletFile));
      response.walletAddresses.push(address);
    }

    responses.push(response);
  }

  return responses;
}
