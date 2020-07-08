import { Type } from '../../archollib'
export const partnome: Type = {
  tid: 'test_archol_com_hw.partnome',
  base: 'string',
  validate(val:string) {
    if(! /^\w+/g.test(val)) return 'parte de nome inválida'
    return false
  }
}

export const allTypes = [partnome]
