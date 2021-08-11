import { TokenType } from './TokenType'

export default interface Token {
  line: number
  column: number
  type: TokenType
  value: string
}
