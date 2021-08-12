import Node from './Node'

export default class ParenthesisStatement extends Node {
  constructor(public body: Node[] = []) {
    super()
  }

  public toJSON(): any {
    return {
      ParenthesisStatement: {
        body: this.body,
      },
    }
  }
}
