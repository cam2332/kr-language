import Position from '../types/Position'
import Node from './Node'

export default class ObjectExpression extends Node {
  constructor(public properties: Node[] = [], position: Position) {
    super('ObjectExpression', position)
  }

  public toJSON(): any {
    return {
      ObjectExpression: {
        properties: this.properties,
      },
    }
  }
}
