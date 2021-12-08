import Environment from './Environment'
import InterpreterError from './InterpreterError'
import KrCallable from './KrCallable'
import Node from '../AST/Node'
import VariableDeclaration from '../AST/VariableDeclaration'
import VariableDeclarator from '../AST/VariableDeclarator'
import Identifier from '../AST/Identifier'
import UnaryExpression from '../AST/UnaryExpression'
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
      case 'UnaryExpression': {
        const unaryExpression = node as UnaryExpression,
          right = this.evaluate(unaryExpression.right)
        switch (unaryExpression.operator) {
          case '-': {
            this.checkNumberOperand(right)
            return -right
          }
          case '!': {
            return !this.isTruthy(right)
          }
        }
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


  private checkNumberOperand(operand: Object): void {
    if (typeof operand === 'number') {
      return
    }
    // TODO: add position to error when you add it to Node classes
    throw new InterpreterError('Operand must be a number.')
  }

  private checkNumberOperands(left: Object, right: Object): void {
    if (typeof left === 'number' && typeof right === 'number') {
      return
    }
    // TODO: add position to error when you add it to Node classes
    throw new InterpreterError('Operands must be a numbers.')
  }

  private isTruthy(object: Object): boolean {
    if (!object) {
      return false
    }
    if (typeof object === 'boolean') {
      return object
    }
    return true
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
