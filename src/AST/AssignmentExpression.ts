import Position from '../types/Position'
import Node from './Node'

export default class AssignmentExpression extends Node {
  constructor(
    public left: Node,
    public operator: string,
    public right: Node,
    position: Position
  ) {
    super('AssignmentExpression', position)
  }

  public toJSON(): any {
    return {
      AssignmentExpression: {
        left: this.left,
        operator: this.operator,
        right: this.right,
        position: this.$position,
      },
    }
  }
}
