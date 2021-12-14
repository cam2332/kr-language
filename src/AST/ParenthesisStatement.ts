import Position from '../types/Position'
import Node from './Node'

export default class ParenthesisStatement extends Node {
  constructor(public body: Node, position: Position) {
    super('ParenthesisStatement', position)
  }

  public toJSON(): any {
    return {
      ParenthesisStatement: {
        body: this.body,
        position: this.$position,
      },
    }
  }
}
