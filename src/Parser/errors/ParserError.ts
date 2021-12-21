import KrError from '../../types/KrError'
import Position from '../../types/Position'

export default class ParserError extends Error implements KrError {
  constructor(
    message: string,
    public position: Position = {
      start: { line: -1, column: -1 },
      end: { line: -1, column: -1 },
    }
  ) {
    super(message)
    super.name = 'Parser Error'
  }
}
