import Identifier from './Identifier'
import Node from './Node'

export default class CallExpression extends Node {
  constructor(public callee: Identifier, public args: Node[]) {
    super()
    this.$type = 'CallExpression'
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
