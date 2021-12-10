import Environment from './Environment'
import InterpreterError from './InterpreterError'
import KrCallable from './KrCallable'
import Node from '../AST/Node'
import VariableDeclaration from '../AST/VariableDeclaration'
import Identifier from '../AST/Identifier'
import UnaryExpression from '../AST/UnaryExpression'
import NumericLiteral from '../AST/NumericLiteral'
import BooleanLiteral from '../AST/BooleanLiteral'
import BinaryExpression from '../AST/BinaryExpression'
import KrFunction from './KrFunction'
import FunctionDeclaration from '../AST/FunctionDeclaration'
import CallExpression from '../AST/CallExpression'
import StringLiteral from '../AST/StringLiteral'
import NativeKrFunction from './NativeKrFunctions'
import ParenthesisStatement from '../AST/ParenthesisStatement'

export default class Interpreter {
  readonly globals: Environment = new Environment()
  private environment: Environment = this.globals
  constructor() {
    const nativePrintFunction: NativeKrFunction = new NativeKrFunction(
      new Identifier('print'),
      [new Identifier('text')],
      (args) => {
        console.log(args[0])
      },
      this.environment
    )
    this.globals.define('print', nativePrintFunction)
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
      case 'BinaryExpression': {
        const binaryExpression = node as BinaryExpression,
          left = this.evaluate(binaryExpression.left),
          right = this.evaluate(binaryExpression.right)

        switch (binaryExpression.operator) {
          case '!=': {
            return !this.isEqual(left, right)
          }
          case '==': {
            return this.isEqual(left, right)
          }
          case '>': {
            this.checkNumberOperands(left, right)
            return left > right
          }
          case '>=': {
            this.checkNumberOperands(left, right)
            return left >= right
          }
          case '<': {
            this.checkNumberOperands(left, right)
            return left < right
          }
          case '<=': {
            this.checkNumberOperands(left, right)
            return left <= right
          }
          case '-': {
            this.checkNumberOperands(left, right)
            return (left as number) - (right as number)
          }
          case '+': {
            if (typeof left === 'number' && typeof right === 'number') {
              return left + right
            }
            if (typeof left === 'string' && typeof right === 'string') {
              return left + right
            }
            // TODO: add position to error when you add it to Node classes
            throw new InterpreterError('Operands must be strings or numbers.')
          }
          case '/': {
            this.checkNumberOperands(left, right)
            return (left as number) / (right as number)
          }
          case '*': {
            this.checkNumberOperands(left, right)
            return (left as number) * (right as number)
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

        this.checkArity(args, callee)

        const callResult = callee.call(this, args)
        if (callResult) {
          return callResult
        } else {
          return undefined as unknown as Object
        }
      }
      case 'ParenthesisStatement': {
        return this.evaluate((node as ParenthesisStatement).body)
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
        const variableDeclaration = node as VariableDeclaration,
          name = (variableDeclaration.name as Identifier).value,
          value: Object = this.evaluate(variableDeclaration.init)
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

  executeBlock(statements: Node[], environment: Environment): void {
    const previous: Environment = this.environment
    try {
      this.environment = environment

      statements.forEach((statement) => this.execute(statement))
    } finally {
      this.environment = previous
    }
  }

  evaluateReturnStatement(
    statement: Node,
    environment: Environment
  ): Object | undefined {
    const previous: Environment = this.environment
    try {
      this.environment = environment

      const result = this.evaluate(statement)
      this.environment = previous
      return result
    } finally {
      this.environment = previous
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

  private isEqual(a: Object, b: Object): boolean {
    if ((a === null && b === null) || (a === undefined && b === undefined)) {
      return true
    }
    if (a === null || a === undefined) {
      return false
    }

    return a === b
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

  private checkArity(args: Object[], callee: KrCallable): void {
    if (args.length !== callee.arity()) {
      throw new InterpreterError(
        'Expected ' +
          callee.arity() +
          ' argument' +
          (callee.arity() > 1 ? 's' : '') +
          ' but got ' +
          args.length +
          '.'
      )
    }
    return
  }
}
