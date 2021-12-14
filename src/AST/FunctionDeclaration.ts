import TokenString from '../types/TokenString'
import { TokenType } from '../types/TokenType'
import BlockStatement from './BlockStatement'
import Identifier from './Identifier'
import Node from './Node'
import ReturnStatement from './ReturnStatement'

export default class FunctionDeclaration extends Node {
  constructor(
    public name: Identifier,
    public parameters: Node[] = [],
    public body: BlockStatement | undefined = undefined,
    public returnType: TokenType = TokenType.VOID_TYPE,
    public returnStatement: ReturnStatement | undefined = undefined
  ) {
    super()
    this.$type = 'FunctionDeclaration'
  }

  public toJSON(): any {
    return {
      FunctionDeclaration: {
        name: this.name,
        parameters: this.parameters,
        body: this.body,
        returnType: this.returnType && TokenString[this.returnType],
        returnStatement: this.returnStatement,
      },
    }
  }
}
