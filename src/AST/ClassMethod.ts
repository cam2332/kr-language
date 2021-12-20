import Node from './Node'
import Identifier from './Identifier'
import Position from '../types/Position'
import BlockStatement from './BlockStatement'
import { TokenType } from '../types/TokenType'
import TokenString from '../types/TokenString'
import { Accessibility } from './ClassDeclaration'

type MethodKind = 'method' | 'constructor'

export default class ClassMethod extends Node {
  constructor(
    public name: Identifier,
    public parameters: Node[] = [],
    public body: BlockStatement,
    public iStatic: boolean,
    public accessibility: Accessibility,
    public kind: MethodKind,
    public returnType: TokenType = TokenType.VOID_TYPE,
    position: Position
  ) {
    super('ClassMethod', position)
  }

  public toJSON(): any {
    return {
      ClassMethod: {
        name: this.name,
        parameters: this.parameters,
        body: this.body,
        static: this.iStatic,
        accessibility: this.accessibility,
        kind: this.kind,
        returnType: this.returnType && TokenString[this.returnType],
        position: this.$position,
      },
    }
  }
}
