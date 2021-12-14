import Position from '../types/Position'
import Node from './Node'

export default class StringLiteral extends Node {
  constructor(public value: string, position: Position) {
    super('StringLiteral', position)
  }

  public toJSON(): any {
    return {
      StringLiteral: {
        value: this.value,
      },
    }
  }
}
