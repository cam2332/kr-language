import Position from '../types/Position'
import EnumMember from './EnumMember'
import Identifier from './Identifier'
import Node from './Node'

export default class EnumDeclaration extends Node {
  constructor(
    public name: Identifier,
    public members: EnumMember[],
    position: Position
  ) {
    super('EnumDeclaration', position)
  }

  toJSON(): any {
    return {
      EnumDeclaration: {
        name: this.name,
        members: this.members,
        position: this.$position,
      },
    }
  }
}
