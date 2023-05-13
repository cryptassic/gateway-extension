
import { promises as fs } from 'fs';
import path from 'path';

import { rootPath } from '../../paths';

/**
 * @param filename - JSON file to load
 */
export async function loadData<T>(filename: string): Promise<T> {
  const dataDir: string = path.join(rootPath(), 'src/services/data/');

  const data = JSON.parse(
    await fs.readFile(dataDir + filename.replace(/\s/, ''), 'utf8')
  );

  return data;
}
