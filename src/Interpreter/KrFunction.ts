import FunctionDeclaration from '../AST/FunctionDeclaration'
import Identifier from '../AST/Identifier'
import Environment from './Environment'
import Interpreter from './Interpreter'
import InterpreterError from './InterpreterError'
import KrCallable from './KrCallable'

export default class KrFunction implements KrCallable {
  private readonly declaration: FunctionDeclaration
  private readonly closure: Environment

  private readonly isInitializer

  constructor(
    declaration: FunctionDeclaration,
    closure: Environment,
    isInitializer: boolean
  ) {
    this.declaration = declaration
    this.closure = closure
    this.isInitializer = isInitializer
  }

  // Override KrCallable
  arity(): number {
    return this.declaration.parameters.length
  }
  // Override KrCallable
  call(interpreter: Interpreter, args: Object[]): Object | undefined | void {
    const environment: Environment = new Environment(this.closure)
    for (let i = 0; i < this.declaration.parameters.length; i++) {
      environment.define(
        (this.declaration.parameters[i] as Identifier).value,
        args[i]
      )
    }

    try {
      if (this.declaration.body && this.declaration.body?.body) {
        interpreter.executeBlock(this.declaration.body?.body, environment)
      }
      if (this.declaration.returnStatement) {
        const result = interpreter.evaluateReturnStatement(
          this.declaration.returnStatement.argument,
          environment
        )
        if (result instanceof Object) {
          return result
        }
      }
    } catch (error) {
      throw new InterpreterError(
        "Unexpected error while executing block in function '" +
          this.declaration.name.value +
          "'. "
      )
    }
    if (!this.declaration.body || !this.declaration.body?.body) {
      throw new InterpreterError(
        "Unexpected empty block in function '" +
          this.declaration.name.value +
          "'. "
      )
    }

    if (this.isInitializer) return this.closure.getAt(0, 'this') as Object

    return
  }

  toString(): string {
    return '<fn ' + this.declaration.name.value + '>'
  }
}
