import fse from 'fs-extra';
import path from 'path';
import { rootPath } from '../../paths';
import { Network } from './types';

export function resolveDBPath(oldPath: string): string {
  if (oldPath.charAt(0) === '/') return oldPath;
  const dbDir: string = path.join(rootPath(), 'db/');
  fse.mkdirSync(dbDir, { recursive: true });
  return path.join(dbDir, oldPath);
}

export function getNetwork(network: string): Network {
  return network === 'mainnet' ? Network.Mainnet : Network.Testnet;
}

export function getIndex(chain:string, network:string): string {
  return `${chain}_${network}`;
}