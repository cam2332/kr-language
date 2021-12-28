import FunctionDeclaration from '../AST/FunctionDeclaration'
import Identifier from '../AST/Identifier'
import TokenString from '../types/TokenString'
import Environment from './Environment'
import Interpreter from './Interpreter'
import InterpreterError from './errors/InterpreterError'
import KrCallable from './KrCallable'
import KrInstance from './KrInstance'
import Return from './Return'
import KrValue from './types/KrValue'

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
  call(
    interpreter: Interpreter,
    args: KrValue[]
  ): KrValue | KrInstance | undefined | void {
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
    } catch (error) {
      // TODO: add return value type check
      if (error instanceof Return) {
        if (this.isInitializer)
          return this.closure.getAt(0, 'this') as KrInstance

        if (error.value !== null) {
          return error.value as KrValue | KrInstance | undefined
        }
        return
      }
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

    if (this.isInitializer) return this.closure.getAt(0, 'this') as KrValue

    return
  }

  toString(): string {
    return '<fn ' + this.declaration.name.value + '>'
  }
}
