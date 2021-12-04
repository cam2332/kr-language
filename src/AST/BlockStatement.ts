import Node from './Node'

export default class BlockStatement extends Node {
  constructor(public body: Node[] = []) {
    super()
    this.$type = 'BlockStatement'
  }

  public toJSON(): any {
    return {
      BlockStatement: {
        body: this.body,
      },
    }
  }
}
