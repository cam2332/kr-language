import Position from '../types/Position'
import Node from './Node'

export default class NumericLiteral extends Node {
  constructor(public value: number, position: Position) {
    super('NumericLiteral', position)
  }

  public toJSON(): any {
    return {
      NumericLiteral: {
        value: this.value,
        position: this.$position,
      },
    }
  }
}
