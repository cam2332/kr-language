export default class InterpreterError extends Error {
  constructor(
    message: string,
    public position: {
      start: { line: number; column: number }
      end: { line: number; column: number }
    } = { start: { line: -1, column: -1 }, end: { line: -1, column: -1 } }
  ) {
    super(message)
  }
}
