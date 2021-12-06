import Node from './Node'

export default class BooleanLiteral extends Node {
  constructor(public value: boolean) {
    super()
    this.$type = 'BooleanLiteral'
  }

  public toJSON(): any {
    return {
      BooleanLiteral: {
        value: this.value,
      },
    }
  }
}
