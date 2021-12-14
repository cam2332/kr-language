import Position from '../../types/Position'

export default class InterpreterError extends Error {
  constructor(
    message: string,
    public position: Position = {
      start: { line: -1, column: -1 },
      end: { line: -1, column: -1 },
    }
  ) {
    super(message)
    super.name = 'InterpreterError'
  }
}
