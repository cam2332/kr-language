import Position from '../types/Position'
import Node from './Node'

export default class BooleanLiteral extends Node {
  constructor(public value: boolean, position: Position) {
    super('BooleanLiteral', position)
  }

  public toJSON(): any {
    return {
      BooleanLiteral: {
        value: this.value,
        position: this.$position,
      },
    }
  }
}
