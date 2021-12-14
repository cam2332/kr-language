import Position from '../types/Position'
import Node from './Node'

export default class Program extends Node {
  constructor(public body: Node[] = [], position: Position) {
    super('Program', position)
  }

  public toJSON(): any {
    return {
      Program: {
        body: this.body,
        position: this.$position,
      },
    }
  }
}
