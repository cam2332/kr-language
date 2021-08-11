import Node from './Node'

export default class Identifier extends Node {
  value: string

  constructor(value: string) {
    super()
    this.value = value
  }

  public toJSON(): any {
    return {
      Identifier: {
        value: this.value,
      },
    }
  }
}
