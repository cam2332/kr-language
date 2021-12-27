import Position from '../types/Position'
import Identifier from './Identifier'
import Node from './Node'
import ObjectExpression from './ObjectExpression'
import VariableDeclaration from './VariableDeclaration'

export default class ForInStatement extends Node {
  constructor(
    public left: VariableDeclaration | Identifier,
    public right: ObjectExpression | Identifier,
    public body: Node[] = [],
    position: Position
  ) {
    super('ForInStatement', position)
  }

  public toJSON(): any {
    return {
      ForInStatement: {
        left: this.left,
        right: this.right,
        body: this.body,
        position: this.$position,
      },
    }
  }
}
