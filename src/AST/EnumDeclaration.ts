import EnumMember from './EnumMember'
import Identifier from './Identifier'
import Node from './Node'

export default class EnumDeclaration extends Node {
  constructor(public name: Identifier, public members: EnumMember[]) {
    super()
    this.$type = 'EnumDeclaration'
  }

  toJSON(): any {
    return {
      EnumDeclaration: {
        name: this.name,
        members: this.members,
      },
    }
  }
}
