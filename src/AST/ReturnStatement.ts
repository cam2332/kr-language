import Position from '../types/Position'
import Node from './Node'

export default class ReturnStatement extends Node {
  constructor(public argument: Node | undefined, position: Position) {
    super('ReturnStatement', position)
  }

  public toJSON(): any {
    return {
      ReturnStatement: {
        argument: this.argument,
        position: this.$position,
      },
    }
  }
}
