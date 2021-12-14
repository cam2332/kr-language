import { TokenType } from './TokenType'

export default interface Token {
  start: { line: number; column: number }
  end: { line: number; column: number }
  type: TokenType
  value: string
}
