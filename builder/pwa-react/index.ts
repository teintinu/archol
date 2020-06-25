import { Builder } from "../types";

export const pwaReact: Builder = {
  async build(app) {
    console.log('pwaReact: ' + app.name)
  }
}
