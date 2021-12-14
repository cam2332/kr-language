import Position from '../types/Position'
import Identifier from './Identifier'
import Node from './Node'

export default class VariableDeclarator extends Node {
  constructor(public name: Identifier, public init: Node, position: Position) {
    super('VariableDeclarator', position)
  }

  public toJSON(): any {
    return {
      VariableDeclarator: {
        name: this.name,
        init: this.init,
      },
    }
  }
}
