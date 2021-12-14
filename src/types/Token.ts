import { TokenType } from './TokenType'

export default interface Token {
  position: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  type: TokenType
  value: string
}
