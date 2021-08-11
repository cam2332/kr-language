export default class ParserError extends Error {
  constructor(
    message: string,
    public position: { line: number; column: number } = { line: -1, column: -1 }
  ) {
    super(message)
  }
}
