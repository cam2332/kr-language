import Position from '../types/Position'
import Node from './Node'

export default class BinaryExpression extends Node {
  constructor(
    public left: Node,
    public operator: string,
    public right: Node,
    position: Position
  ) {
    super('BinaryExpression', position)
  }

  public toJSON(): any {
    return {
      BinaryExpression: {
        left: this.left,
        operator: this.operator,
        right: this.right,
        position: this.$position,
      },
    }
  }
}
