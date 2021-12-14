import Position from '../types/Position'
import Node from './Node'

export default class ArrayExpression extends Node {
  constructor(public elements: Node[], position: Position) {
    super('ArrayExpression', position)
  }

  public toJSON(): any {
    return {
      ArrayExpression: {
        elements: this.elements,
        position: this.$position,
      },
    }
  }
}
