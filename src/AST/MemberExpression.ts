import Identifier from './Identifier'
import Node from './Node'

export default class MemberExpression extends Node {
  constructor(public object: Identifier, public property: Node) {
    super()
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
