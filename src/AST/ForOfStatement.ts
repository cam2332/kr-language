import Position from '../types/Position'
import ArrayExpression from './ArrayExpression'
import Identifier from './Identifier'
import Node from './Node'
import StringLiteral from './StringLiteral'
import VariableDeclaration from './VariableDeclaration'

export default class ForOfStatement extends Node {
  constructor(
    public left: VariableDeclaration | Identifier,
    public right:
      | ArrayExpression
      | StringLiteral
      | Identifier /* MapExpression, SetExpression */,
    public body: Node[] = [],
    position: Position
  ) {
    super('ForOfStatement', position)
  }

  public toJSON(): any {
    return {
      ForOfStatement: {
        left: this.left,
        right: this.right,
        body: this.body,
        position: this.$position,
      },
    }
  }
}
