import * as fs from "fs";
import { dirname } from "path";
import util from 'util';
import mkdirp from 'mkdirp'

export const readFile = util.promisify(fs.readFile);
export const writeFile = util.promisify(fs.writeFile);

export async function writeLines (filename: string, lines: string[]) {
  const dir = dirname(filename)
  await mkdirp(dir)
  await writeFile(filename, lines.join('\n'), 'utf-8')
}