import Node from './Node'

export default class Program extends Node {
  constructor(public body: Node[] = []) {
    super()
    this.$type = 'Program'
  }

  public toJSON(): any {
    return {
      Program: {
        body: this.body,
      },
    }
  }
}
