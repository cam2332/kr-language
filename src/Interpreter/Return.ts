export default class Return extends Error {
  constructor(public value: Object | null) {
    super('Return value')
    super.name = 'Return'
  }
}
