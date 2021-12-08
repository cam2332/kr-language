import Environment from './Environment'
import InterpreterError from './InterpreterError'
import KrCallable from './KrCallable'
import Node from '../AST/Node'
import VariableDeclaration from '../AST/VariableDeclaration'
import VariableDeclarator from '../AST/VariableDeclarator'
import Identifier from '../AST/Identifier'
import NumericLiteral from '../AST/NumericLiteral'
import BooleanLiteral from '../AST/BooleanLiteral'
import KrFunction from './KrFunction'
import FunctionDeclaration from '../AST/FunctionDeclaration'
import CallExpression from '../AST/CallExpression'
import StringLiteral from '../AST/StringLiteral'

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
    switch (node.$type) {
      case 'Identifier': {
        return this.environment.get((node as Identifier).value)
      }
      case 'NumericLiteral': {
        return (node as NumericLiteral).value
      }
      case 'BooleanLiteral': {
        return (node as BooleanLiteral).value
      }
      case 'StringLiteral': {
        return (node as StringLiteral).value
      }
      case 'CallExpression': {
        const callExpression = node as CallExpression,
          callee = this.environment.get(callExpression.callee.value),
          args: Object[] = []

        callExpression.args.forEach((argument) => {
          args.push(this.evaluate(argument))
        })

        if (!this.isKrCallable(callee)) {
          throw new InterpreterError('Can only call functions and classes.')
        }

        if (args.length !== callee.arity()) {
          throw new InterpreterError(
            'Expected ' +
              callee.arity() +
              ' arguments but got ' +
              args.length +
              '.'
          )
        }

        const callResult = callee.call(this, args)
        if (callResult instanceof Object) {
          return callResult
        } else {
          return undefined as unknown as Object
        }
      }
      default: {
        // TODO: add position to error when you add it to Node classes
        throw new InterpreterError('Unexpected expression')
      }
    }
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

  private isKrCallable(arg: any): arg is KrCallable {
    return (
      arg &&
      arg.arity &&
      typeof arg.arity === 'function' &&
      arg.call &&
      typeof arg.call === 'function'
    )
  }
}
