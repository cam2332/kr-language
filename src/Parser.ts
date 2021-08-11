import Token from './Token'
import {
  isOperator,
  isAssignOperator,
  isPrimitiveType,
  TokenType,
} from './TokenType'
import Node from './AST/Node'
import Identifier from './AST/Identifier'
import Program from './AST/Program'
import VariableDeclaration, { VariableKind } from './AST/VariableDeclaration'
import VariableDeclarator from './AST/VariableDeclarator'
import NumericLiteral from './AST/NumericLiteral'
import BinaryExpression from './AST/BinaryExpression'
import CallExpression from './AST/CallExpression'
import ParserError from './ParserError'
import ExpressionStatement from './AST/ExpressionStatement'
import AssignmentExpression from './AST/AssignmentExpression'

export function mainParse(tokens: Token[]): Program {
  const nodes: Node[] = []

  let node
  while (tokens.length > 0) {
    try {
      node = parse(tokens)
    } catch (err) {
      console.log(err)
      break
    }
    nodes.push(node)
  }
  return new Program(nodes)
}

export function parse(tokens: Token[]): Node {
  if (tokens.length > 0) {
    if (
      tokens[0].type === TokenType.CONST ||
      tokens[0].type === TokenType.LET
    ) {
      const kind = tokens[0].value as VariableKind
      if (tokens[1].type !== TokenType.IDENTIFIER) {
        throw new ParserError(
          `Expected IDENTIFIER but got ${TokenType[tokens[1].type]}`,
          {
            line: tokens[1].line,
            column: tokens[1].column,
          }
        )
      }
      const identifier = new Identifier(tokens[1].value)
      if (tokens[2].type === TokenType.COLON) {
        if (
          tokens[3].type === TokenType.IDENTIFIER ||
          isPrimitiveType(tokens[3])
        ) {
          identifier.typeAnnotation = tokens[3].value
          tokens.splice(0, 2)
        } else {
          throw new ParserError(
            `Expected IDENTIFIER or PRIMITIVE_TYPE (Integer, Float, String) but got ${
              TokenType[tokens[3].type]
            }`,
            {
              line: tokens[3].line,
              column: tokens[3].column,
            }
          )
        }
      }
      if (tokens[2].type !== TokenType.ASSIGNMENT) {
        throw new ParserError(
          `Expected ASSIGNMENT '=' but got ${TokenType[tokens[2].type]}`,
          {
            line: tokens[2].line,
            column: tokens[2].column,
          }
        )
      }

      tokens.splice(0, 3)

      return new VariableDeclaration(kind, [
        new VariableDeclarator(identifier, parse(tokens)),
      ])
    } else if (
      tokens[0].type === TokenType.INTEGER ||
      tokens[0].type === TokenType.FLOAT
    ) {
      const left = new NumericLiteral(
        tokens[0].type === TokenType.INTEGER
          ? parseInt(tokens[0].value)
          : parseFloat(tokens[0].value)
      )
      tokens.splice(0, 1)
      if (isOperator(tokens[0])) {
        const operator = tokens[0].value
        tokens.splice(0, 1)
        return new BinaryExpression(left, operator, parse(tokens))
      } else {
        return left
      }
    } else if (tokens[0].type === TokenType.IDENTIFIER) {
      const callee = new Identifier(tokens[0].value)
      if (tokens[1].type === TokenType.LEFT_PARENTHESIS) {
        const args = []
        if (tokens[2].type === TokenType.RIGHT_PARENTHESIS) {
          tokens.splice(0, 3)
        } else {
          tokens.splice(0, 2)

          let i = 0
          let leftParenthesis = 1
          while (leftParenthesis > 0) {
            if (tokens[i].type === TokenType.LEFT_PARENTHESIS) {
              leftParenthesis += 1
            }
            if (tokens[i].type === TokenType.RIGHT_PARENTHESIS) {
              leftParenthesis -= 1
            }
            i += 1
          }
          const argsTokens = tokens.splice(0, i)

          let node
          while (argsTokens.length > 0) {
            try {
              if (argsTokens[0].type === TokenType.COMMA) {
                argsTokens.splice(0, 1)
              }
              node = parse(argsTokens)
            } catch (err) {
              console.log(err)
              break
            }
            args.push(node)
          }
        }
        return new CallExpression(callee, args)
      } else if (isAssignOperator(tokens[1])) {
        const operator = tokens[1].value
        tokens.splice(0, 2)
        return new ExpressionStatement(
          new AssignmentExpression(callee, operator, parse(tokens))
        )
      } else {
        const identifier = callee
        tokens.splice(0, 1)
        return identifier
      }
    }
  throw new Error('End')
  return new Node()
}
