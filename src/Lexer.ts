import * as rd from 'readline'
import Token from './types/Token'
import TokenString from './types/TokenString'
import { TokenType } from './types/TokenType'

const PARENTHESIS_REGEX = new RegExp('[()]')
const BRACES_REGEX = new RegExp('[{}]')
const BRACKETS_REGEX = new RegExp('[\\[\\]]')
const NUMERIC_REGEX = new RegExp('[0-9.]')
const DIGITS_REGEX = new RegExp('[0-9]')
const ALPHANUMERIC_REGEX = new RegExp('[A-Za-z0-9]')
const ALPHANUMERIC_WHITESPACE_REGEX = new RegExp('[A-Za-z0-9(\\s*)]')

let lineNumber = 0

export function tokenize(file: rd.Interface): Token[] {
  const data: Token[] = []

  let commentBlock = 0
  let literal = false
  file.on('line', (line: string) => {
    lineNumber++

    const tokens: Token[] = []
    let i = 0
    let identifier: Token = {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
      type: TokenType.TOK_LAST,
      value: '',
    }

    while (i < line.length) {
      if (line[i] === ' ') {
        if (
          identifier &&
          identifier.type !== TokenType.TOK_LAST &&
          identifier.value !== ''
        ) {
          tokens.push(identifier)
          identifier = {
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i },
            type: TokenType.TOK_LAST,
            value: '',
          }
        }
        i += 1
        continue
      }

      if (line[i] === '*' && getNextCharacter(line, i) === '/') {
        if (commentBlock === 0) {
          throw new Error(
            "Encountered multi line comment terminator '*/' in non commented block. Line " +
              lineNumber +
              '[' +
              i +
              ']'
          )
        }
        i += 2
        --commentBlock
        continue
      }

      if (line[i] === '/' && getNextCharacter(line, i) === '*') {
        i += 2
        ++commentBlock
        continue
      }

      if (commentBlock) {
        ++i
        continue
      }

      if (line[i] === '/' && getNextCharacter(line, i) === '/') {
        i = line.length
        continue
      }

      if (line[i] === "'") {
        if (!literal) {
          literal = true
          i += 1
          let stringValue = ''
          identifier = {
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i },
            type: TokenType.STRING,
            value: stringValue,
          }
          while (i < line.length) {
            if (line[i] === "'") {
              literal = false
              identifier.value = stringValue
              identifier.end.column = i
              tokens.push({ ...identifier })
              identifier.type = TokenType.TOK_LAST
              identifier.value = ''
              i += 1
              break
            } else if (!ALPHANUMERIC_WHITESPACE_REGEX.test(line[i])) {
              throw new Error(
                'Encountered invalid character in string literal. Line ' +
                  lineNumber +
                  '[' +
                  i +
                  ']'
              )
            }
            stringValue += line[i]
            i += 1
          }
        }
        continue
      }

      // if (line[i] === ',') {
      //   console.log('comma')
      //   tokens.push({
      //     line: lineNumber,
      //     column: i,
      //     type: TokenType.COMMA,
      //     value: ',',
      //   })
      //   i += 1
      //   continue
      // }

      // if (line[i] === ':') {
      //   console.log('colon')
      //   tokens.push({
      //     line: lineNumber,
      //     column: i,
      //     type: TokenType.COLON,
      //     value: ':',
      //   })
      //   i += 1
      //   continue
      // }

      if (PARENTHESIS_REGEX.test(line[i])) {
        if (
          identifier &&
          identifier.type !== TokenType.TOK_LAST &&
          identifier.value !== ''
        ) {
          tokens.push(identifier)
          identifier.type = TokenType.TOK_LAST
          identifier.value = ''
        }
        if (line[i] === '(') {
          tokens.push({
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i + 1 },
            type: TokenType.LEFT_PARENTHESIS,
            value: line[i],
          })
        } else if (line[i] === ')') {
          tokens.push({
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i + 1 },
            type: TokenType.RIGHT_PARENTHESIS,
            value: line[i],
          })
        }
        i += 1
        continue
      }

      if (BRACES_REGEX.test(line[i])) {
        if (
          identifier &&
          identifier.type !== TokenType.TOK_LAST &&
          identifier.value !== ''
        ) {
          tokens.push(identifier)
          identifier.type = TokenType.TOK_LAST
          identifier.value = ''
        }
        if (line[i] === '{') {
          tokens.push({
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i + 1 },
            type: TokenType.LEFT_BRACE,
            value: line[i],
          })
        } else if (line[i] === '}') {
          tokens.push({
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i + 1 },
            type: TokenType.RIGHT_BRACE,
            value: line[i],
          })
        }
        i += 1
        continue
      }

      if (BRACKETS_REGEX.test(line[i])) {
        if (
          identifier &&
          identifier.type !== TokenType.TOK_LAST &&
          identifier.value !== ''
        ) {
          tokens.push(identifier)
          identifier.type = TokenType.TOK_LAST
          identifier.value = ''
        }
        if (line[i] === '[') {
          tokens.push({
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i + 1 },
            type: TokenType.LEFT_BRACKET,
            value: line[i],
          })
        } else if (line[i] === ']') {
          tokens.push({
            start: { line: lineNumber, column: i },
            end: { line: lineNumber, column: i + 1 },
            type: TokenType.RIGHT_BRACKET,
            value: line[i],
          })
        }
        i += 1
        continue
      }

      if (line[i] === '.') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.DOT,
          value: line[i],
        })
        i += 1
        continue
      }

      if (
        NUMERIC_REGEX.test(line[i]) &&
        identifier.type === TokenType.TOK_LAST &&
        identifier.value === ''
      ) {
        const localIdentifier = getNumber({ line: line, index: i })
        if (localIdentifier.identifier.value.length === 0) {
          throw new Error('Parse error when reading number at line: ' + line)
        }
        tokens.push(localIdentifier.identifier)
        identifier.type = TokenType.TOK_LAST
        identifier.value = ''
        i += localIdentifier.outIndex - i
        continue
        //   identifier = { type: TokenTypes.NUMBER, value: line[i] }
        //   i += 1
        //   continue
        // } else if (
        //   numericRegex.test(line[i]) &&
        //   identifier.type === TokenTypes.NUMBER &&
        //   identifier.value.length > 0
        // ) {
        //   identifier = {
        //     type: TokenTypes.NUMBER,
        //     value: identifier.value + line[i],
        //   }
        //   i += 1
        //   continue
      }

      if (ALPHANUMERIC_REGEX.test(line[i])) {
        const column = i
        let localIdentifier: string = line[i++]
        while (i < line.length) {
          if (!ALPHANUMERIC_REGEX.test(line[i])) {
            break
          }
          localIdentifier += line[i++]
        }
        identifier = {
          start: { line: lineNumber, column: column },
          end: { line: lineNumber, column: i },
          type: TokenType.IDENTIFIER,
          value: localIdentifier,
        }
        identifier.type = classifyString(localIdentifier)
        tokens.push({ ...identifier })
        identifier.type = TokenType.TOK_LAST
        identifier.value = ''
        // if (identifier.type === TokenTypes.IDENTIFIER) {
        //   identifier = {
        //     type: TokenTypes.IDENTIFIER,
        //     value: identifier.value + line[i],
        //   }
        // } else {
        //   identifier = { type: TokenTypes.IDENTIFIER, value: line[i] }
        // }
        //i += 1
        continue
      }

      if (line[i] === '+' && getNextCharacter(line, i) === '+') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.INCREMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '+' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.ADDITION_ASSIGNMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      }
      if (line[i] === '+') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.ADDITION,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '-' && getNextCharacter(line, i) === '-') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.DECREMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '-' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.SUBTRACTION_ASSIGNMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '-') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.SUBTRACTION,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '*' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.MULTIPLICATION_ASSIGNMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '*') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.MULTIPLICATION,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '/' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.DIVISION_ASSIGNMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '/') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.DIVISION,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '%' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.MODULUS_ASSIGNMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '%') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.MODULUS,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '^' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.POWER_ASSIGNMENT,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '^') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.POWER,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '=' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.EQUAL,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.ASSIGNMENT,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '>' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.GREATER_THAN_OR_EQUAL,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '>') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.GREATER_THAN,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '<' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.LESS_THAN_OR_EQUAL,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '<') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.LESS_THAN,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '!' && getNextCharacter(line, i) === '=') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.NOT_EQUAL,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '!') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.NOT,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '&' && getNextCharacter(line, i) === '&') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.AND,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '|' && getNextCharacter(line, i) === '|') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 2 },
          type: TokenType.OR,
          value: line[i] + getNextCharacter(line, i),
        })
        i += 2
        continue
      } else if (line[i] === '?') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.QUESTION_MARK,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === ':') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.COLON,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === '.') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.DOT,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === ',') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.COMMA,
          value: line[i],
        })
        i += 1
        continue
      } else if (line[i] === ';') {
        tokens.push({
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.SEMI_COLON,
          value: line[i],
        })
        i += 1
        continue
      } else {
        identifier = {
          start: { line: lineNumber, column: i },
          end: { line: lineNumber, column: i + 1 },
          type: TokenType.OPERATOR,
          value: line[i],
        }
      }

      // const operatorsRegex = new RegExp(
      //   '([+\\-*/%^<>=!][=])|([+\\-*/%^<>=!?:.,:])',
      // )
      // if (operatorsRegex.test(line[i])) {
      //   console.log('operator')
      //   if (identifier.type === TokenType.ADDITION) {
      //     if (line[i] === '+') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.INCREMENT,
      //         value: identifier.value + line[i],
      //       }
      //     } else if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.ADDITION_ASSIGNMENT,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.SUBTRACTION) {
      //     if (line[i] === '-') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.DECREMENT,
      //         value: identifier.value + line[i],
      //       }
      //     } else if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.SUBTRACTION_ASSIGNMENT,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.MULTIPLICATION) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.MULTIPLICATION_ASSIGNMENT,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.DIVISION) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.DIVISION_ASSIGNMENT,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.MODULUS) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.MODULUS_ASSIGNMENT,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.POWER) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.POWER_ASSIGNMENT,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.ASSIGNMENT) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.EQUAL,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.NOT) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.NOT_EQUAL,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.GREATER_THAN) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.GREATER_THAN_OR_EQUAL,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else if (identifier.type === TokenType.LESS_THAN) {
      //     if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.LESS_THAN_OR_EQUAL,
      //         value: identifier.value + line[i],
      //       }
      //     }
      //   } else {
      //     if (line[i] === '+') {
      //       line[i] === '+' &&
      //         (identifier = {
      //           line: lineNumber,
      //           column: i,
      //           type: TokenType.ADDITION,
      //           value: line[i],
      //         })
      //     } else if (line[i] === '-') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.SUBTRACTION,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '*') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.MULTIPLICATION,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '/') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.DIVISION,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '%') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.MODULUS,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '^') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.POWER,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '=') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.ASSIGNMENT,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '>') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.GREATER_THAN,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '<') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.LESS_THAN,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '!') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.NOT,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '?') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.QUESTION_MARK,
      //         value: line[i],
      //       }
      //     } else if (line[i] === ':') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.COLON,
      //         value: line[i],
      //       }
      //     } else if (line[i] === '.') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.DOT,
      //         value: line[i],
      //       }
      //     } else if (line[i] === ',') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.COMMA,
      //         value: line[i],
      //       }
      //     } else if (line[i] === ';') {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.SEMI_COLON,
      //         value: line[i],
      //       }
      //     } else {
      //       identifier = {
      //         line: lineNumber,
      //         column: i,
      //         type: TokenType.OPERATOR,
      //         value: line[i],
      //       }
      //     }
      //   }
      //   i += 1
      //   continue
      // }

      console.log('undefined char')
      i += 1
      continue
    }
    if (
      identifier &&
      identifier.type !== TokenType.TOK_LAST &&
      identifier.value !== ''
    ) {
      tokens.push(identifier as Token)
    }
    data.push(...tokens)
  })
  return data
}

function getNumber(data: { line: string; index: number }): {
  identifier: Token
  outIndex: number
} {
  let localIndex = data.index
  const localIdentifier: Token = {
    start: {
      line: lineNumber,
      column: localIndex,
    },
    end: {
      line: lineNumber,
      column: localIndex,
    },
    type: TokenType.INTEGER,
    value: '',
  }
  const firstDigitAt = localIndex
  const success = true
  let dotEncountered = -1
  while (
    localIndex < data.line.length &&
    NUMERIC_REGEX.test(data.line[localIndex])
  ) {
    const c: string = data.line[localIndex]
    const next: string = getNextCharacter(data.line, localIndex)
    switch (c) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        break
      case '.':
        if (dotEncountered === -1) {
          if (DIGITS_REGEX.test(next)) {
            dotEncountered = localIndex
            localIdentifier.type = TokenType.FLOAT
          } else {
            return { identifier: localIdentifier, outIndex: localIndex }
          }
        } else {
          throw new Error(
            'Encountered dot (.) character when the number being retrieved (from column ' +
              (firstDigitAt + 1) +
              ') already had one at column ' +
              (dotEncountered + 1)
          )
        }
        break
      default:
        if (ALPHANUMERIC_REGEX.test(data.line[localIndex])) {
          throw new Error(
            'Encountered invalid character ' +
              c +
              ' while retrieving a number (from column ' +
              (firstDigitAt + 1) +
              ')'
          )
        } else {
          return { identifier: localIdentifier, outIndex: localIndex }
        }
    }
    if (!success) {
      return {
        identifier: {
          start: localIdentifier.start,
          end: {
            line: lineNumber,
            column: localIndex,
          },
          type: TokenType.TOK_LAST,
          value: '',
        },
        outIndex: localIndex,
      }
    }
    localIdentifier.value += c
    localIdentifier.end.column += 1
    localIndex += 1
  }
  return { identifier: localIdentifier, outIndex: localIndex }
}

function classifyString(data: string): TokenType {
  if (data === TokenString[TokenType.IMPORT]) return TokenType.IMPORT
  else if (data === TokenString[TokenType.FUNCTION]) return TokenType.FUNCTION
  else if (data === TokenString[TokenType.RETURN]) return TokenType.RETURN
  else if (data === TokenString[TokenType.ENUM]) return TokenType.ENUM
  else if (data === TokenString[TokenType.STRUCT]) return TokenType.STRUCT
  else if (data === TokenString[TokenType.IF]) return TokenType.IF
  else if (data === TokenString[TokenType.ELSE]) return TokenType.ELSE
  else if (data === TokenString[TokenType.FOR]) return TokenType.FOR
  else if (data === TokenString[TokenType.IN]) return TokenType.IN
  else if (data === TokenString[TokenType.CONTINUE]) return TokenType.CONTINUE
  else if (data === TokenString[TokenType.BREAK]) return TokenType.BREAK
  else if (data === TokenString[TokenType.TRUE]) return TokenType.TRUE
  else if (data === TokenString[TokenType.FALSE]) return TokenType.FALSE
  else if (data === TokenString[TokenType.CONST]) return TokenType.CONST
  else if (data === TokenString[TokenType.LET]) return TokenType.LET
  else if (data === TokenString[TokenType.INTEGER_TYPE])
    return TokenType.INTEGER_TYPE
  else if (data === TokenString[TokenType.FLOAT_TYPE])
    return TokenType.FLOAT_TYPE
  else if (data === TokenString[TokenType.STRING_TYPE])
    return TokenType.STRING_TYPE
  else if (data === TokenString[TokenType.VOID_TYPE]) return TokenType.VOID_TYPE

  return TokenType.IDENTIFIER
}

function getNextCharacter(line: string, index: number): string {
  return line[index + 1 < line.length ? index + 1 : 0]
}
