import Position from '../types/Position'
import AssignmentExpression from './AssignmentExpression'
import BinaryExpression from './BinaryExpression'
import Identifier from './Identifier'
import Node from './Node'
import VariableDeclaration from './VariableDeclaration'

export default class ForStatement extends Node {
  constructor(
    public initializer: VariableDeclaration | Identifier,
    public condition: BinaryExpression,
    public update: AssignmentExpression,
    public body: Node[] = [],
    position: Position
  ) {
    super('ForStatement', position)
  }

  public toJSON(): any {
    return {
      ForStatement: {
        initializer: this.initializer,
        condition: this.condition,
        update: this.update,
        body: this.body,
        position: this.$position,
      },
    }
  }
}
