import Position from '../types/Position'
import CallExpression from './CallExpression'
import Identifier from './Identifier'
import Node from './Node'

export default class MemberExpression extends Node {
  constructor(
    public object: Identifier | MemberExpression | CallExpression,
    public property: Identifier | MemberExpression | CallExpression,
    position: Position
  ) {
    super('MemberExpression', position)
  }

  public toJSON(): any {
    return {
      MemberExpression: {
        object: this.object,
        property: this.property,
      },
    }
  }
}
