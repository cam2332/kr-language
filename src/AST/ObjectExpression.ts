import Position from '../types/Position'
import Node from './Node'
import ObjectProperty from './ObjectProperty'

export default class ObjectExpression extends Node {
  constructor(public properties: ObjectProperty[] = [], position: Position) {
    super('ObjectExpression', position)
  }

  public toJSON(): any {
    return {
      ObjectExpression: {
        properties: this.properties,
        position: this.$position,
      },
    }
  }
}
