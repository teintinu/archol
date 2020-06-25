import { Application, Builder } from "./types";

export interface Workspace {
  builders: {
    [name: string]: Builder
  },
  getApp(name: string): Promise<Application>
}
