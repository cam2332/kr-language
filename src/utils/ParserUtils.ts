import ParserError from '../types/errors/ParserError'
import Token from '../types/Token'
import { TokenType } from '../types/TokenType'

/**
 * First token in array must be of type startTokenType and last token must be of type endTokenType
 */
export function getTokensBetweenTokens(
  tokens: Token[],
  startTokenType: TokenType,
  endTokenType: TokenType
): Token[] {
  if (tokens.length > 0 && tokens[0].type !== startTokenType) {
    throw new ParserError(
      `Expected ${TokenType[startTokenType]} but got ${
        TokenType[tokens[0].type]
      }`,
      {
        start: tokens[0].start,
        end: tokens[0].end,
      }
    )
  }
  if (tokens.length > 1 && tokens[1].type === endTokenType) {
    return []
  } else {
    tokens.splice(0, 1)
    let i = 0
    let startElements = 1
    while (startElements > 0) {
      if (tokens[i].type === startTokenType) {
        startElements += 1
      }
      if (tokens[i].type === endTokenType) {
        startElements -= 1
      }
      i += 1
    }
    const foundTokens = tokens.splice(0, i)
    foundTokens.pop()
    return foundTokens
  }
}
