import Position from '../types/Position'
import Identifier from './Identifier'
import Node from './Node'

export default class EnumMember extends Node {
  constructor(
    public name: Identifier,
    public initializer: Node | undefined = undefined,
    position: Position
  ) {
    super('EnumMember', position)
  }

  toJSON(): any {
    return {
      EnumMember: {
        name: this.name,
        initializer: this.initializer,
      },
    }
  }
}
