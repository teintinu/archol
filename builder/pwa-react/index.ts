import { Builder } from "../types";

export const pwaReact: Builder = {
  async build(ws, app) {
    console.log('pwaReact: ' + app.name)
  }
}
