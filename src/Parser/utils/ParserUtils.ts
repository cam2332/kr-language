import ParserError from '../errors/ParserError'
import Token from '../../types/Token'
import { TokenType } from '../../types/TokenType'
import Position, { initMinusOne } from '../../types/Position'

/**
 * First token in array must be of type startTokenType and last token must be of type endTokenType
 */
export function getTokensBetweenTokens(
  tokens: Token[],
  startTokenType: TokenType,
  endTokenType: TokenType
): { foundTokens: Token[]; endTokenPosition: Position } {
  if (tokens.length > 0 && tokens[0].type !== startTokenType) {
    throw new ParserError(
      `Expected ${TokenType[startTokenType]} but got ${
        TokenType[tokens[0].type]
      }`,
      tokens[0].position
    )
  }
  if (tokens.length > 1 && tokens[1].type === endTokenType) {
    return { foundTokens: [], endTokenPosition: initMinusOne() }
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
    const endToken = foundTokens.pop()
    return {
      foundTokens,
      endTokenPosition: endToken ? endToken.position : initMinusOne(),
    }
  }
}
