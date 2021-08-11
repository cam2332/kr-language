import Node from './Node'

export default class BinaryExpression extends Node {
  constructor(public left: Node, public operator: string, public right: Node) {
    super()
  }

  public toJSON(): any {
    return {
      BinaryExpression: {
        left: this.left,
        operator: this.operator,
        right: this.right,
      },
    }
  }
}
