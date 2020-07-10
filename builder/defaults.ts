import { Type } from './typesDef';

export const defaultTypes: {
  [typename: string]: Type
} = {
  string: {
    base: 'string',
    name: 'string',
    validate: false,
    format: false,
    parse: false,
    uri: 'string',
    getId () {
      return ''
    }
  }
}
