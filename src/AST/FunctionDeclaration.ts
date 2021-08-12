import TokenString from '../TokenString'
import { TokenType } from '../TokenType'
import BlockStatement from './BlockStatement'
import Identifier from './Identifier'
import Node from './Node'
import Parameter from './Parameter'
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
