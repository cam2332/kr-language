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
  CONTINUE,
  BREAK,
  TRUE,
  FALSE,
  CONST,
  LET,
  //Types
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
