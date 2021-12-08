import Environment from './Environment'
import Node from '../AST/Node'
import VariableDeclaration from '../AST/VariableDeclaration'
import VariableDeclarator from '../AST/VariableDeclarator'
import Identifier from '../AST/Identifier'
import KrFunction from './KrFunction'
import FunctionDeclaration from '../AST/FunctionDeclaration'

export default class Interpreter {
  readonly globals: Environment = new Environment()
  private environment: Environment = this.globals
  constructor() {
  }

  interpret(nodes: Node[]): void {
    try {
      nodes.forEach((node) => this.execute(node))
    } catch (error) {
      console.error('e', error)
    }
  }

  private evaluate(node: Node): Object {
  }

  private execute(node: Node): void {
    switch (node.$type) {
      case 'VariableDeclaration': {
        const variableDeclaration = node as VariableDeclaration
        variableDeclaration.declarations.forEach((declaration) => {
          this.execute(declaration)
        })
        break
      }
      case 'VariableDeclarator': {
        const variableDeclarator = node as VariableDeclarator,
          name = (variableDeclarator.name as Identifier).value,
          value: Object = this.evaluate(variableDeclarator.init)
        this.environment.define(name, value)
        break
      }
      case 'FunctionDeclaration': {
        const functionDeclaration = node as FunctionDeclaration
        const func: KrFunction = new KrFunction(
          functionDeclaration,
          this.environment,
          false
        )
        this.environment.define(functionDeclaration.name.value, func)
        break
      }
      case 'CallExpression': {
        this.evaluate(node as CallExpression)
      }
    }
  }
}
