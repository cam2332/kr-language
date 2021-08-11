import Node from './Node'

export default class ExpressionStatement extends Node {
  constructor(public expression: Node) {
    super()
  }

  public toJSON(): any {
    return {
      ExpressionStatement: {
        expression: this.expression,
      },
    }
  }
}
