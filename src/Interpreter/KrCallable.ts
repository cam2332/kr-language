import Interpreter from './Interpreter'
import KrInstance from './KrInstance'
import KrValue from './types/KrValue'

export default interface KrCallable {
  arity: () => number
  call: (
    interpreter: Interpreter,
    args: KrValue[]
  ) => KrValue | KrInstance | undefined | void
}
