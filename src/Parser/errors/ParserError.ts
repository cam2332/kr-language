import Position from '../../types/Position'

export default class ParserError extends Error {
  constructor(
    message: string,
    public position: Position = {
      start: { line: -1, column: -1 },
      end: { line: -1, column: -1 },
    }
  ) {
    super(message)
  }
}
