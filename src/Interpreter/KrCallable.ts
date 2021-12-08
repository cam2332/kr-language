import Interpreter from './Interpreter'

export default interface KrCallable {
  arity: () => number
  call: (interpreter: Interpreter, args: Object[]) => Object | undefined | void
}
