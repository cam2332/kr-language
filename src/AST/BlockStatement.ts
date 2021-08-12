import Node from './Node'

export default class BlockStatement extends Node {
  constructor(public body: Node[] = []) {
    super()
  }

  public toJSON(): any {
    return {
      BlockStatement: {
        body: this.body,
      },
    }
  }
}
