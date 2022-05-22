import Environment from './Environment'
import InterpreterError from './errors/InterpreterError'
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
import ObjectExpression from '../AST/ObjectExpression'
import Position, { initMinusOne } from '../types/Position'
import ReturnStatement from '../AST/ReturnStatement'
import Return from './Return'
import Kr from '../Kr'
import NullLiteral from '../AST/NullLiteral'
import AssignmentExpression from '../AST/AssignmentExpression'
import MemberExpression from '../AST/MemberExpression'
import KrObject from './types/KrObject'
import KrValue from './types/KrValue'
import KrInstance from './KrInstance'
import KrArray from './types/KrArray'
import ArrayExpression from '../AST/ArrayExpression'
import ArrayMemberExpression from '../AST/ArrayMemberExpression'
import EnumDeclaration from '../AST/EnumDeclaration'
import KrEnum from './types/KrEnum'
import IfStatement from '../AST/IfStatement'
import BlockStatement from '../AST/BlockStatement'

export default class Interpreter {
  readonly globals: Environment = new Environment()
  private environment: Environment = this.globals
  constructor() {
    const nativePrintFunction: NativeKrFunction = new NativeKrFunction(
      new Identifier('print', 'void', initMinusOne()),
      [new Identifier('text', 'string', initMinusOne())],
      (args) => {
        console.log(args[0].getValue() || null)
      },
      this.environment
    )
    this.globals.define('print', nativePrintFunction)
  }

  interpret(nodes: Node[]): void {
    try {
      nodes.forEach((node) => this.execute(node))
    } catch (error: any) {
      if (error instanceof InterpreterError) {
        Kr.printError(error)
      } else {
        console.error(error)
      }
    }
  }

  private evaluate(node: Node): KrValue | KrFunction | KrInstance {
    switch (node.$type) {
      case 'Identifier': {
        return this.environment.get(
          (node as Identifier).value,
          node.$position
        ) as KrValue | KrFunction
      }
      case 'UnaryExpression': {
        const unaryExpression = node as UnaryExpression,
          right = this.evaluate(unaryExpression.right)
        switch (unaryExpression.operator) {
          case '-': {
            this.checkNumberOperand(right, unaryExpression.right.$position)
            return new KrValue(-right)
          }
          case '!': {
            if (!KrValue.isKrValue(right)) {
              throw new InterpreterError(
                'Right operand must be a KrValue.',
                unaryExpression.right.$position
              )
            }
            return new KrValue(!right.getValue())
          }
        }
      }
      case 'BinaryExpression': {
        const binaryExpression = node as BinaryExpression,
          left = this.evaluate(binaryExpression.left),
          right = this.evaluate(binaryExpression.right),
          position = {
            start: binaryExpression.left.$position.start,
            end: binaryExpression.right.$position.end,
          }

        switch (binaryExpression.operator) {
          case '!=': {
            return new KrValue(!this.isEqual(left, right))
          }
          case '==': {
            return new KrValue(this.isEqual(left, right))
          }
          case '>': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(left > right)
          }
          case '>=': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(left >= right)
          }
          case '<': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(left < right)
          }
          case '<=': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(left <= right)
          }
          case '-': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(
              (left as unknown as number) - (right as unknown as number)
            )
          }
          case '+': {
            if (
              KrValue.isKrValue(left) &&
              typeof left.getValue() === 'number' &&
              KrValue.isKrValue(right) &&
              typeof right.getValue() === 'number'
            ) {
              return new KrValue(left.getValue() + right.getValue())
            }
            if (
              KrValue.isKrValue(left) &&
              typeof left.getValue() === 'string' &&
              KrValue.isKrValue(right) &&
              typeof right.getValue() === 'string'
            ) {
              return new KrValue(left.getValue() + right.getValue())
            }
            if (
              KrValue.isKrValue(left) &&
              typeof left.getValue() === 'string' &&
              KrValue.isKrValue(right) &&
              typeof right.getValue() === 'number'
            ) {
              return new KrValue(
                left.getValue() + this.stringify(right.getValue())
              )
            }
            if (
              KrValue.isKrValue(left) &&
              typeof left.getValue() === 'string' &&
              KrValue.isKrValue(right) &&
              typeof right.getValue() === 'boolean'
            ) {
              return new KrValue(
                left.getValue() + this.stringify(right.getValue())
              )
            }
            throw new InterpreterError('Operands must be strings or numbers.', {
              start: binaryExpression.left.$position.start,
              end: binaryExpression.right.$position.end,
            })
          }
          case '/': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(
              (left as unknown as number) / (right as unknown as number)
            )
          }
          case '*': {
            this.checkNumberOperands(
              (left as KrValue).getValue(),
              (right as KrValue).getValue(),
              position
            )
            return new KrValue(
              (left as KrValue).getValue() * (right as KrValue).getValue()
            )
          }
          case '%': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(
              (left as unknown as number) % (right as unknown as number)
            )
          }
          case '^': {
            this.checkNumberOperands(left, right, position)
            return new KrValue(
              Math.pow(left as unknown as number, right as unknown as number)
            )
          }
        }
      }
      case 'NumericLiteral': {
        return new KrValue((node as NumericLiteral).value)
      }
      case 'BooleanLiteral': {
        return new KrValue((node as BooleanLiteral).value)
      }
      case 'StringLiteral': {
        return new KrValue((node as StringLiteral).value)
      }
      case 'NullLiteral': {
        return new KrValue(null)
      }
      case 'CallExpression': {
        const callExpression = node as CallExpression,
          callee = this.environment.get(callExpression.callee.value),
          args: KrValue[] = []

        callExpression.args.forEach((argument) => {
          args.push(this.evaluate(argument) as KrValue)
        })

        if (!this.isKrCallable(callee)) {
          throw new InterpreterError('Can only call functions and classes.')
        }

        this.checkArity(args, callee)

        const callResult = callee.call(this, args)
        if (callResult) {
          return callResult
        } else {
          return undefined as unknown as KrValue
        }
      }
      case 'ParenthesisStatement': {
        return this.evaluate((node as ParenthesisStatement).body)
      }
      case 'ObjectExpression': {
        return new KrObject(
          (node as ObjectExpression).properties.reduce((obj, property) => {
            obj.set(
              property.key.value,
              this.evaluate(property.value) as KrValue
            )
            return obj
          }, new Map<string, KrValue>())
        )
      }
      case 'MemberExpression': {
        const memberExpr = node as MemberExpression
        const obj = this.evaluate(memberExpr.object)

        if (KrObject.isKrObject(obj)) {
          const property = obj.get(memberExpr.property.value)

          return property
        }
        if (KrEnum.isKrEnum(obj)) {
          const property = obj.get(memberExpr.property.value)

          return property
        }
        throw new InterpreterError(
          "Object is not 'KrObject'.",
          memberExpr.object.$position
        )
      }
      case 'ArrayExpression': {
        return new KrArray(
          (node as ArrayExpression).elements.map((element) => {
            return this.evaluate(element) as KrValue
          }, [])
        )
      }
      case 'ArrayMemberExpression': {
        const arrMemberExpr = node as ArrayMemberExpression
        const obj = this.evaluate(arrMemberExpr.object)

        if (KrArray.isKrArray(obj)) {
          const index = this.evaluate(arrMemberExpr.property)
          const property = obj.get((index as KrValue).getValue())

          return property
        }
        throw new InterpreterError(
          "Object is not 'KrArray'.",
          arrMemberExpr.object.$position
        )
      }
      default: {
        throw new InterpreterError(
          "Unexpected expression '" + node.$type + "'",
          node.$position
        )
      }
    }
  }

  private execute(node: Node): void {
    switch (node.$type) {
      case 'VariableDeclaration': {
        const variableDeclaration = node as VariableDeclaration,
          name = (variableDeclaration.name as Identifier).value,
          value = this.evaluate(variableDeclaration.init)
        this.environment.define(name, value)
        break
      }
      case 'EnumDeclaration': {
        const enumDeclaration = node as EnumDeclaration,
          name = enumDeclaration.name.value
        let valueCounter = new KrValue(0)
        const members = enumDeclaration.members.reduce((obj, member) => {
          if (member.initializer) {
            valueCounter = this.evaluate(member.initializer) as KrValue
          }
          obj.set(member.name.value, valueCounter)
          valueCounter = new KrValue(valueCounter.getValue() + 1)

          return obj
        }, new Map<string, KrValue>())
        this.environment.define(name, new KrEnum(members))
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
        break
      }
      case 'ReturnStatement': {
        const returnStatement = node as ReturnStatement
        let value = null
        if (returnStatement.argument) {
          value = this.evaluate(returnStatement.argument)
        }
        throw new Return(value)
      }
      case 'AssignmentExpression': {
        const assignmentExpr = node as AssignmentExpression

        switch (assignmentExpr.operator) {
          case '=': {
            if (assignmentExpr.left.$type === 'Identifier') {
              const name = (assignmentExpr.left as Identifier).value,
                left = this.evaluate(assignmentExpr.left),
                right = this.evaluate(assignmentExpr.right)

              if (KrValue.isKrValue(left) && KrValue.isKrValue(right)) {
                left.setValue(right.getValue())
              }
            } else if (assignmentExpr.left.$type === 'MemberExpression') {
              const left = this.evaluate(assignmentExpr.left),
                right = this.evaluate(assignmentExpr.right)

              if (KrValue.isKrValue(left) && KrValue.isKrValue(right)) {
                left.setValue(right.getValue())
              }
            }
            break
          }
          case '+=': {
            if (assignmentExpr.left.$type === 'Identifier') {
              const name = (assignmentExpr.left as Identifier).value,
                left = this.evaluate(assignmentExpr.left),
                right = this.evaluate(assignmentExpr.right)

              if (
                KrValue.isKrValue(left) &&
                typeof left.getValue() === 'number' &&
                KrValue.isKrValue(right) &&
                typeof right.getValue() === 'number'
              ) {
                left.setValue(left.getValue() + right.getValue())
              } else if (
                KrValue.isKrValue(left) &&
                typeof left.getValue() === 'string' &&
                KrValue.isKrValue(right) &&
                typeof right.getValue() === 'string'
              ) {
                left.setValue(left.getValue() + right.getValue())
              } else if (
                KrValue.isKrValue(left) &&
                typeof left.getValue() === 'string' &&
                KrValue.isKrValue(right) &&
                typeof right.getValue() === 'number'
              ) {
                left.setValue(
                  left.getValue() + this.stringify(right.getValue())
                )
              } else if (
                KrValue.isKrValue(left) &&
                typeof left.getValue() === 'string' &&
                KrValue.isKrValue(right) &&
                typeof right.getValue() === 'boolean'
              ) {
                left.setValue(
                  left.getValue() + this.stringify(right.getValue())
                )
              } else {
                console.log(
                  'e',
                  (left as KrValue).getValue(),
                  (right as KrValue).getValue()
                )
                throw new InterpreterError(
                  'Operands must be strings or numbers.',
                  {
                    start: assignmentExpr.left.$position.start,
                    end: assignmentExpr.right.$position.end,
                  }
                )
              }
            }
            break
          }
        }
        break
      }
      case 'IfStatement': {
        const ifStatement = node as IfStatement,
          test = this.evaluate(ifStatement.test)

        if (!KrValue.isKrValue(test)) {
          throw new InterpreterError(
            'Test in IF statement must be a KrValue.',
            ifStatement.test.$position
          )
        }
        if (!!test.getValue()) {
          this.executeBlock(ifStatement.consequent.body, this.environment)
        } else {
          if (ifStatement.alternate) {
            if (ifStatement.alternate.$type === 'IfStatement') {
              this.execute(ifStatement.alternate)
            } else {
              this.executeBlock(
                (ifStatement.alternate as BlockStatement).body,
                this.environment
              )
            }
          }
        }
        break
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

  private checkNumberOperand(operand: Object, position: Position): void {
    if (
      typeof operand === 'object' &&
      KrValue.isKrValue(operand as KrValue) &&
      typeof (operand as KrValue).getValue() === 'number'
    ) {
      return
    }
    if (typeof operand === 'number') {
      return
    }
    throw new InterpreterError('Operand must be a number.', position)
  }

  private checkNumberOperands(
    left: Object,
    right: Object,
    position: Position
  ): void {
    if (typeof left === 'number' && typeof right === 'number') {
      return
    }
    throw new InterpreterError('Operands must be a numbers.', position)
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

  private stringify(object: Object): string {
    if (!object) {
      return 'null'
    }
    return object.toString()
  }
}
