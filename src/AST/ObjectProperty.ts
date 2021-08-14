import Identifier from './Identifier'
import Node from './Node'

export default class ObjectProperty extends Node {
  constructor(
    public key: Identifier,
    public value: Node,
    public shorthand: boolean = false
  ) {
    super()
    this.$type = 'ObjectProperty'
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
