import Position from '../types/Position'
import CallExpression from './CallExpression'
import Identifier from './Identifier'
import Node from './Node'

export default class ArrayMemberExpression extends Node {
  constructor(
    public object: Identifier | ArrayMemberExpression | CallExpression,
    public property: Node,
    position: Position
  ) {
    super('ArrayMemberExpression', position)
  }

  public toJSON(): any {
    return {
      ArrayMemberExpression: {
        object: this.object,
        property: this.property,
        position: this.$position,
      },
    }
  }
}
