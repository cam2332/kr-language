import Position from '../types/Position'
import Node from './Node'

export default class BlockStatement extends Node {
  constructor(public body: Node[] = [], position: Position) {
    super('BlockStatement', position)
  }

  public toJSON(): any {
    return {
      BlockStatement: {
        body: this.body,
      },
    }
  }
}
