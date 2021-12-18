import Position from '../types/Position'
import Node from './Node'

export default class NullLiteral extends Node {
  constructor(position: Position) {
    super('NullLiteral', position)
  }

  public toJSON(): any {
    return {
      NullLiteral: {
        position: this.$position,
      },
    }
  }
}
