import Position from '../types/Position'
import Node from './Node'

export default class UnaryExpression extends Node {
  constructor(public operator: string, public right: Node, position: Position) {
    super('UnaryExpression', position)
  }

  public toJSON(): any {
    return {
      UnaryExpression: {
        operator: this.operator,
        right: this.right,
      },
    }
  }
}
