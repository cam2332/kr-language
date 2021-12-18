import Position from '../types/Position'
import TokenString from '../types/TokenString'
import { TokenType } from '../types/TokenType'
import BlockStatement from './BlockStatement'
import Identifier from './Identifier'
import Node from './Node'

export default class FunctionDeclaration extends Node {
  constructor(
    public name: Identifier,
    public parameters: Node[] = [],
    public body: BlockStatement,
    public returnType: TokenType = TokenType.VOID_TYPE,
    position: Position
  ) {
    super('FunctionDeclaration', position)
  }

  public toJSON(): any {
    return {
      FunctionDeclaration: {
        name: this.name,
        parameters: this.parameters,
        body: this.body,
        returnType: this.returnType && TokenString[this.returnType],
        position: this.$position,
      },
    }
  }
}
