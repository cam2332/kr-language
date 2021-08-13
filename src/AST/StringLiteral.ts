import Node from './Node'

export default class StringLiteral extends Node {
  constructor(public value: string) {
    super()
  }

  public toJSON(): any {
    return {
      StringLiteral: {
        value: this.value,
      },
    }
  }
}
