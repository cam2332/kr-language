import Node from './Node'

export default class NumericLiteral extends Node {
  constructor(public value: number) {
    super()
    this.$type = 'NumericLiteral'
  }

  public toJSON(): any {
    return {
      NumericLiteral: {
        value: this.value,
      },
    }
  }
}
