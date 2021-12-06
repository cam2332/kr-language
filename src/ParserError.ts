export default class ParserError extends Error {
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
