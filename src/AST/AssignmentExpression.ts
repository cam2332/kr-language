import Node from './Node'

export default class AssignmentExpression extends Node {
  constructor(public left: Node, public operator: string, public right: Node) {
    super()
    this.$type = 'AssignmentExpression'
  }

  public toJSON(): any {
    return {
      AssignmentExpression: {
        left: this.left,
        operator: this.operator,
        right: this.right,
      },
    }
  }
}
