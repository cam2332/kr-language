import Node from './Node'

export default class CallExpression extends Node {
  constructor(public callee: Node, public args: Node[]) {
    super()
  }

  public toJSON(): any {
    return {
      CallExpression: {
        callee: this.callee,
        arguments: this.args,
      },
    }
  }
}
