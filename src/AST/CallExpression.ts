import Position from '../types/Position'
import Identifier from './Identifier'
import Node from './Node'

export default class CallExpression extends Node {
  constructor(
    public callee: Identifier,
    public args: Node[],
    position: Position
  ) {
    super('CallExpression', position)
  }

  public toJSON(): any {
    return {
      CallExpression: {
        callee: this.callee,
        arguments: this.args,
        position: this.$position,
      },
    }
  }
}
