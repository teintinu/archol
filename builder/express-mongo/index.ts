import { Builder } from "../types";

export const expressMongo: Builder = {
  async build(app) {
    console.log('expressMongo: ' + app.name)
  }
}