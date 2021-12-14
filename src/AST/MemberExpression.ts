import CallExpression from './CallExpression'
import Identifier from './Identifier'
import Node from './Node'

export default class MemberExpression extends Node {
  constructor(
    public object: Identifier | MemberExpression | CallExpression,
    public property: Identifier | MemberExpression | CallExpression
  ) {
    super()
    this.$type = 'MemberExpression'
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
