import KrFunction from './KrFunction'
import KrInstance from './KrInstance'
import KrValue from './types/KrValue'

export default class Return extends Error {
  constructor(public value: KrValue | KrFunction | KrInstance | null) {
    super('Return value')
    super.name = 'Return'
  }
}
