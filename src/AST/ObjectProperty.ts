import Position from '../types/Position'
import Identifier from './Identifier'
import Node from './Node'

export default class ObjectProperty extends Node {
  constructor(
    public key: Identifier,
    public value: Node,
    public shorthand: boolean = false,
    position: Position
  ) {
    super('ObjectProperty', position)
  }

  public toJSON(): any {
    return {
      ObjectProperty: {
        key: this.key,
        shorthand: this.shorthand,
        value: this.value,
      },
    }
  }
}
