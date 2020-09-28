import * as fs from "fs";
import { dirname } from "path";
import util from 'util';
import mkdirp from 'mkdirp'

export const readdir = util.promisify(fs.readdir);
export const readFile = util.promisify(fs.readFile);
export const writeFile = util.promisify(fs.writeFile);

export interface SourcePartWriter {
  ident (): void;
  identBack (): void;
  write (...s: string[]): void;
  writeln (...s: string[]): void;
  writelines (lines: string[], idented?: boolean): void;
  getText (): string;
  getIdent (): string;
}

export function createSourceWriter (filename: string) {
  const part = createSourcePartWriter('')
  return {
    ...part,
    async save () {
      const dir = dirname(filename)
      await mkdirp(dir)
      await writeFile(filename, part.getText(), 'utf-8')
    },
    part () {
      const sub = createSourcePartWriter(part.getIdent())
      return {
        ...sub,
        append () {
          part.write(sub.getText())
        }
      }
    }
  }
}

export function createSourcePartWriter (ident: string): SourcePartWriter {
  const txt: string[] = []
  let empty = true
  const self: SourcePartWriter = {
    ident () {
      ident += '  '
    },
    identBack () {
      ident = ident.substr(2)
    },
    write (...s: string[]) {
      if (empty) txt.push(ident)
      s.forEach(w)
      empty = false
    },
    writeln (...s: string[]) {
      if (empty) txt.push(ident)
      s.forEach(w)
      txt.push('\n')
      empty = true
    },
    writelines (lines: string[], idented?: boolean): void {
      if (idented) self.ident()
      lines.forEach((s) => self.writeln(s))
      if (idented) self.identBack()
    },
    getText () {
      return txt.join('')
    },
    getIdent () {
      return ident
    }
  }
  return self
  function w (s: string) {
    txt.push(s.replace(/\n/g, '\n' + ident))
  }
}