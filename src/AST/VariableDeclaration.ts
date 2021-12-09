import Identifier from './Identifier'
import Node from './Node'

export type VariableKind = 'const' | 'let'

export default class VariableDeclaration extends Node {
  constructor(
    public kind: VariableKind,
    public name: Identifier,
    public init: Node
  ) {
    super()
    this.$type = 'VariableDeclaration'
  }

  public toJSON(): any {
    return {
      VariableDeclaration: {
        kind: this.kind,
        name: this.name,
        init: this.init,
      },
    }
  }
}
