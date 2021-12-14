import Position from '../types/Position'
import Node from './Node'

export default class ExpressionStatement extends Node {
  constructor(public expression: Node, position: Position) {
    super('ExpressionStatement', position)
  }

  public toJSON(): any {
    return {
      ExpressionStatement: {
        expression: this.expression,
      },
    }
  }
}
