import Redis, { Callback } from 'ioredis';
import NodeCache from 'node-cache';

import { logger } from './logger';
import { ConfigManagerV2 } from './config-manager-v2';
import { ConfigManagerCertPassphrase as SecretsManager } from './config-manager-cert-passphrase';

const REDIS_USER_ARGUMENT = 'redis_user';
const REDIS_PASSWORD_ARGUMENT = 'redis_password';
const REDIS_USER_ENV = 'REDIS_USER';
const REDIS_PASSWORD_ENV = 'REDIS_PASSWORD';

interface CacheProvider {
  get(key: string): Promise<string | null | undefined>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

const DataTypes = {
  Transaction: 'transaction',
  Pair: 'pair',
  Token: 'token',
  Map: 'map',
} as const;

type ObjectValues<T> = T[keyof T];
export type CacheDataTypes = ObjectValues<typeof DataTypes>;

export class Cache implements CacheProvider {
  private static instance: Cache;
  private provider: NodeCache | Redis;

  constructor() {
    const config = ConfigManagerV2.getInstance();
    try {
      const isEnabled = config.get('redis.enabled');
      if (isEnabled) {
        logger.info(`Redis enabled. Seting as default cache provider.`);

        const host = config.get('redis.host');
        const port = config.get('redis.port');

        const user = SecretsManager.readSecrets(
          REDIS_USER_ARGUMENT,
          REDIS_USER_ENV
        );
        const pwd = SecretsManager.readSecrets(
          REDIS_PASSWORD_ARGUMENT,
          REDIS_PASSWORD_ENV
        );

        if (user && pwd) {
          this.provider = new Redis({
            host: host,
            port: port,
            username: user,
            password: pwd,
          }) as Redis;
          return;
        } else {
          throw new Error(`No username or password provided`);
        }
      } else {
        logger.info(`Redis disabled. Defaulting to node-cache`);
      }
    } catch (error) {
      logger.error(
        `Unable to set redis. Check if redis configuration is properly set up.
        Defaulting to node-cache\nError:${error}`
      );
    }

    //Falback to default node-cache provider.
    this.provider = new NodeCache({ stdTTL: 1800 }) as NodeCache; // set default cache ttl to 30min
  }

  static getInstance(): Cache {
    if (!this.instance) {
      this.instance = new Cache();
    }
    return this.instance;
  }
  public get isNodeCache():boolean {
    return this.provider instanceof NodeCache;
  }
  public get isRedisCache():boolean{
    return this.provider instanceof Redis;
  }

  public async get(
    key: string,
    callback?: Callback<string | null>
  ): Promise<string | null | undefined> {
    let error: Error | null = null;
    let result: string | null | undefined;

    try {
      if (this.isRedisCache) {
        result = await (this.provider as Redis).get(key);
      } else if (this.isNodeCache) {
        result = (this.provider as NodeCache).get(key);
      } else {
        throw new Error(`Cache type not supported`);
      }
    } catch (err) {
      if (err instanceof Error) {
        error = err as Error;
      } else {
        error = new Error(`Cache provider raised unknown error: ${err}`);
      }
    }

    if (callback && typeof callback === 'function') {
      callback(error, result);
    }
    return result;
  }
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    ttl = ttl ? ttl : 600; // default ttl set to 10 minutes

    if (this.isRedisCache) {
      await (this.provider as Redis).set(key, value, 'EX', ttl).catch((err) => {
        logger.error(`Unable to set value in redis. Key:${key}\nError:${err} `);
      });
    } else if (this.isNodeCache) {
      (this.provider as NodeCache).set(key, value, ttl);
    } else {
      throw new Error(`Cache type not supported`);
    }
  }

  public async has(key: string): Promise<boolean> {
    let keyExist = false;

    if (this.isRedisCache) {
      keyExist = (await (this.provider as Redis).exists(key)) === 1 ? true : false;
    } else if (this.isNodeCache) {
      keyExist = (this.provider as NodeCache).has(key);
    } else {
      throw new Error(`Cache type not supported`);
    }

    return keyExist;
  }
  public async clear(): Promise<void> {
    if (this.isRedisCache) {
      await (this.provider as Redis).flushall().catch((err) => {
        logger.error(`Unable to clear redis cache. Error:${err}`);
      });
    } else if (this.isNodeCache) {
      (this.provider as NodeCache).flushAll();
    } else {
      throw new Error(`Cache type not supported`);
    }
  }
}

// entityName examples:
// -> white_whale, injective, etc.
// OR
// -> cosmos, ethereum, etc.
// dataType examples:
// -> pair, token, factory, router, map, transaction, etc.
export function getUniversalKeyPrefix(
  entityName: string,
  chainName: string,
  networkName: string,
  dataType: CacheDataTypes
): string {
  entityName = replaceSeparators(entityName);
  chainName = replaceSeparators(chainName);
  networkName = replaceSeparators(networkName);

  return `${entityName}:${chainName}:${networkName}:${dataType}:`;
}

export function replaceSeparators(value: string): string {
  return value ? value.replace(/[_|:,. ]/g, '.') : '';
}
