import Node from './Node'

export default class ObjectExpression extends Node {
  constructor(public properties: Node[] = []) {
    super()
    this.$type = 'ObjectExpression'
  }

  public toJSON(): any {
    return {
      ObjectExpression: {
        properties: this.properties,
      },
    }
  }
}
