import Node from './Node'

export default class ArrayExpression extends Node {
  constructor(public elements: Node[]) {
    super()
    this.$type = 'ArrayExpression'
  }

  public toJSON(): any {
    return {
      ArrayExpression: {
        elements: this.elements,
      },
    }
  }
}
