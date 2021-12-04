import Node from './Node'

export default class UnaryExpression extends Node {
  constructor(public operator: string, public right: Node) {
    super()
    this.$type = 'UnaryExpression'
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
