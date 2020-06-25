import { Application } from "./types";
import { Workspace } from "./ws";
import * as fs from "fs";
import { resolve, join } from 'path'
import util from 'util';
import { buildApp } from './buildApp';
import { expressMongo } from './express-mongo';
import { pwaReact } from './pwa-react';

const readFile = util.promisify(fs.readFile);
const rootDir = resolve(__dirname + '../../../..')
console.log(rootDir)

const ws: Workspace = {
  builders: {
    "express-mongo": expressMongo,
    "pwa-react": pwaReact,
  },
  async getApp(name) {
    const str = await readFile(rootDir + '/ws/' + name + '.app.json', {
      encoding: 'utf8'
    })
    return JSON.parse(str)
  }
}

async function build_ws() {
  const hw = await ws.getApp('hello/hw')
  await buildApp(ws, hw)
}

build_ws().then( () => console.log('ok') )
