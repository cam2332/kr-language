import Node from './Node'
import VariableDeclarator from './VariableDeclarator'

export type VariableKind = 'const' | 'let'

export default class VariableDeclaration extends Node {
  constructor(
    public kind: VariableKind,
    public declarations: VariableDeclarator[] = []
  ) {
    super()
    this.$type = 'VariableDeclaration'
  }

  public toJSON(): any {
    return {
      VariableDeclaration: {
        kind: this.kind,
        declarations: this.declarations,
      },
    }
  }
}
