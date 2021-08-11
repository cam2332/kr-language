import Node from './Node'

export default class Identifier extends Node {
  constructor(public value: string, public typeAnnotation: string = 'any') {
    super()
  }

  public toJSON(): any {
    return {
      Identifier: {
        value: this.value,
        ...(this.typeAnnotation && { typeAnnotation: this.typeAnnotation }),
      },
    }
  }
}
