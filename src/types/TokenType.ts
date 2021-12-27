import ParserError from '../Parser/errors/ParserError'
import Token from './Token'

export enum TokenType {
  INTEGER,
  FLOAT,
  STRING,
  IDENTIFIER,
  // Keywords
  IMPORT,
  FUNCTION,
  RETURN,
  ENUM,
  STRUCT,
  IF,
  ELSE,
  FOR,
  IN,
  OF,
  CONTINUE,
  BREAK,
  TRUE,
  FALSE,
  NULL,
  CONST,
  LET,
  CLASS,
  EXTENDS,
  THIS,
  SUPER,
  NEW,
  //Types
  BOOLEAN_TYPE,
  INTEGER_TYPE,
  FLOAT_TYPE,
  STRING_TYPE,
  VOID_TYPE,

  // Operators
  OPERATOR,
  // Arithmetic
  ADDITION, // +
  SUBTRACTION, // -
  MULTIPLICATION, // *
  DIVISION, // /
  MODULUS, // %
  POWER, // ^
  INCREMENT, // ++
  DECREMENT, // --
  // Assignment
  ASSIGNMENT, // =
  ADDITION_ASSIGNMENT, // +=
  SUBTRACTION_ASSIGNMENT, // -=
  MULTIPLICATION_ASSIGNMENT, // *=
  DIVISION_ASSIGNMENT, // /=
  MODULUS_ASSIGNMENT, // %=
  POWER_ASSIGNMENT, // ^=
  // Comparison
  EQUAL, // ==
  NOT_EQUAL, // !=
  GREATER_THAN, // >
  LESS_THAN, // <
  GREATER_THAN_OR_EQUAL, // >=
  LESS_THAN_OR_EQUAL, // <=
  // Logical
  AND, // &&
  OR, // ||
  NOT, // !

  // Conditional
  QUESTION_MARK, // ?
  COLON, // :
  // Separators
  DOT, // .
  DOUBLE_DOT, // ..
  COMMA, // ,
  SEMI_COLON, // ;
  // Parenthesis, Braces, Brackets
  LEFT_PARENTHESIS, // (
  RIGHT_PARENTHESIS, // )
  LEFT_BRACE, // {
  RIGHT_BRACE, // }
  LEFT_BRACKET, // [
  RIGHT_BRACKET, // ]

  TOK_LAST,
}

export function isPrimitiveType(token: Token): boolean {
  let isPrimitiveType = false

  isPrimitiveType = token.type === TokenType.BOOLEAN_TYPE
  if (isPrimitiveType) {
    return isPrimitiveType
  }
  isPrimitiveType = token.type === TokenType.INTEGER_TYPE
  if (isPrimitiveType) {
    return isPrimitiveType
  }
  isPrimitiveType = token.type === TokenType.FLOAT_TYPE
  if (isPrimitiveType) {
    return isPrimitiveType
  }
  isPrimitiveType = token.type === TokenType.STRING_TYPE
  if (isPrimitiveType) {
    return isPrimitiveType
  }

  return isPrimitiveType
}

export function isOperator(token: Token): boolean {
  let isOperator = false

  if (!token) {
    throw new ParserError('Expected OPERATOR but got nothing (undefined)')
  }
  // Arithmetic
  isOperator = token.type === TokenType.ADDITION
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.SUBTRACTION
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.MULTIPLICATION
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.DIVISION
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.MODULUS
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.POWER
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.INCREMENT
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.DECREMENT

  if (isOperator) {
    return isOperator
  }

  // Comparison
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.EQUAL
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.NOT_EQUAL
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.GREATER_THAN
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.LESS_THAN
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.GREATER_THAN_OR_EQUAL
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.LESS_THAN_OR_EQUAL
  // Logical
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.AND
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.OR
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.NOT

  return isOperator
}

export function isAssignOperator(token: Token): boolean {
  let isOperator = false

  if (!token) {
    throw new ParserError(
      'Expected ASSIGN OPERATOR but got nothing (undefined)'
    )
  }
  // Assignment
  isOperator = token.type === TokenType.ASSIGNMENT
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.ADDITION_ASSIGNMENT
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.SUBTRACTION_ASSIGNMENT
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.MULTIPLICATION_ASSIGNMENT
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.DIVISION_ASSIGNMENT
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.MODULUS_ASSIGNMENT
  if (isOperator) {
    return isOperator
  }
  isOperator = token.type === TokenType.POWER_ASSIGNMENT
  return isOperator
}

export function isUnaryOperator(token: Token): boolean {
  return token.type === TokenType.SUBTRACTION || token.type === TokenType.NOT
}

export function isBooleanLiteral(token: Token): boolean {
  return token.type === TokenType.TRUE || token.type === TokenType.FALSE
}

export function compareOperatorPriority(left: string, right: string): number {
  const checkPriority = (operator: string) => {
    return operator === '='
      ? 0
      : operator === '+' || operator === '-'
      ? 1
      : operator === '*' || operator === '/'
      ? 2
      : -2
  }
  return checkPriority(right) - checkPriority(left)
}
