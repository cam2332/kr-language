import Identifier from './Identifier'
import Node from './Node'

export default class EnumMember extends Node {
  constructor(
    public name: Identifier,
    public initializer: Node | undefined = undefined
  ) {
    super()
    this.$type = 'EnumMember'
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
