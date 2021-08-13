import Node from './Node'

export default class ReturnStatement extends Node {
  constructor(public argument: Node) {
    super()
    this.$type = 'ReturnStatement'
  }

  public toJSON(): any {
    return {
      ReturnStatement: {
        argument: this.argument,
      },
    }
  }
}
