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
import FunctionDeclaration from './AST/FunctionDeclaration'
import BlockStatement from './AST/BlockStatement'
import ParenthesisStatement from './AST/ParenthesisStatement'
import ReturnStatement from './AST/ReturnStatement'
import ArrayExpression from './AST/ArrayExpression'
import MemberExpression from './AST/MemberExpression'
import StringLiteral from './AST/StringLiteral'
import EnumDeclaration from './AST/EnumDeclaration'
import EnumMember from './AST/EnumMember'
import ObjectProperty from './AST/ObjectProperty'
import ObjectExpression from './AST/ObjectExpression'

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
    } else if (tokens[0].type === TokenType.STRING) {
      const left = new StringLiteral(tokens[0].value)
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
      } else if (isOperator(tokens[1])) {
        const operator = tokens[1].value
        tokens.splice(0, 2)
        return new BinaryExpression(callee, operator, parse(tokens))
      } else if (isAssignOperator(tokens[1])) {
        const operator = tokens[1].value
        tokens.splice(0, 2)
        return new ExpressionStatement(
          new AssignmentExpression(callee, operator, parse(tokens))
        )
      } else if (tokens[1].type === TokenType.LEFT_BRACKET) {
        tokens.splice(0, 2)
        let i = 0
        let leftBrackets = 1
        while (leftBrackets > 0) {
          if (tokens[i].type === TokenType.LEFT_BRACKET) {
            leftBrackets += 1
          }
          if (tokens[i].type === TokenType.RIGHT_BRACKET) {
            leftBrackets -= 1
          }
          i += 1
        }
        const propertyTokens = tokens.splice(0, i)

        let node
        try {
          node = parse(propertyTokens)
          return new MemberExpression(callee, node)
        } catch (err) {
          console.log(err)
        }
      } else if (tokens[1].type === TokenType.COLON) {
        if (
          tokens[2].type === TokenType.IDENTIFIER ||
          isPrimitiveType(tokens[2])
        ) {
          callee.typeAnnotation = tokens[2].value
        } else {
          throw new ParserError(
            `Expected IDENTIFIER or PRIMITIVE_TYPE (Integer, Float, String) but got ${
              TokenType[tokens[2].type]
            }`,
            {
              line: tokens[2].line,
              column: tokens[2].column,
            }
          )
        }
        if (isAssignOperator(tokens[3])) {
          const operator = tokens[3].value
          tokens.splice(0, 4)
          return new ExpressionStatement(
            new AssignmentExpression(callee, operator, parse(tokens))
          )
        }
        tokens.splice(0, 3)
        return callee
      } else {
        const identifier = callee
        tokens.splice(0, 1)
        return identifier
      }
    } else if (tokens[0].type === TokenType.LEFT_PARENTHESIS) {
      const body = []
      tokens.splice(0, 1)
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
      const bodyTokens = tokens.splice(0, i)

      let node
      while (bodyTokens.length > 0) {
        try {
          node = parse(bodyTokens)
        } catch (err) {
          console.log(err)
          break
        }
        body.push(node)
      }

      if (isOperator(tokens[0])) {
        const operator = tokens[0].value
        tokens.splice(0, 1)

        return new BinaryExpression(
          new ParenthesisStatement(body),
          operator,
          parse(tokens)
        )
      } else {
        return new ParenthesisStatement(body)
      }
    } else if (tokens[0].type === TokenType.FUNCTION) {
      if (tokens[1].type !== TokenType.IDENTIFIER) {
        throw new ParserError(
          `Expected IDENTIFIER but got ${TokenType[tokens[1].type]}`,
          {
            line: tokens[1].line,
            column: tokens[1].column,
          }
        )
      }
      const functionDeclaration = new FunctionDeclaration(
        new Identifier(tokens[1].value)
      )
      if (tokens[2].type !== TokenType.LEFT_PARENTHESIS) {
        throw new ParserError(
          `Expected LEFT_PARENTHESIS but got ${TokenType[tokens[2].type]}`,
          {
            line: tokens[2].line,
            column: tokens[2].column,
          }
        )
      }

      if (tokens[3].type === TokenType.RIGHT_PARENTHESIS) {
        tokens.splice(0, 4)
      } else {
        tokens.splice(0, 3)

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
        const paramsTokens = tokens.splice(0, i)

        const params = []
        let node
        while (paramsTokens.length > 0) {
          try {
            if (paramsTokens[0].type === TokenType.COMMA) {
              paramsTokens.splice(0, 1)
            }
            node = parse(paramsTokens)
          } catch (err) {
            console.log(err)
            break
          }
          params.push(node)
        }
        functionDeclaration.parameters = params
      }

      // @ts-ignore
      if (tokens[0].type === TokenType.COLON) {
        if (
          tokens[1].type === TokenType.IDENTIFIER ||
          isPrimitiveType(tokens[1]) ||
          tokens[1].type === TokenType.VOID_TYPE
        ) {
          functionDeclaration.returnType = tokens[1].type
          tokens.splice(0, 2)
        } else {
          throw new ParserError(
            `Expected IDENTIFIER or PRIMITIVE_TYPE (Integer, Float, String, Void?)  but got ${
              TokenType[tokens[1].type]
            }`,
            {
              line: tokens[1].line,
              column: tokens[1].column,
            }
          )
        }
      }
      // @ts-ignore
      if (tokens[0].type === TokenType.LEFT_BRACE) {
        const block = []
        tokens.splice(0, 1)
        let i = 0
        let leftBraces = 1
        while (leftBraces > 0) {
          if (tokens[i].type === TokenType.LEFT_BRACE) {
            leftBraces += 1
          }
          if (tokens[i].type === TokenType.RIGHT_BRACE) {
            leftBraces -= 1
          }
          i += 1
        }
        const blockTokens = tokens.splice(0, i)

        let node
        while (blockTokens.length > 0) {
          try {
            node = parse(blockTokens)
          } catch (err) {
            console.log(err)
            break
          }
          if ((node as ReturnStatement).toJSON().ReturnStatement) {
            functionDeclaration.returnStatement = node as ReturnStatement
          } else {
            block.push(node)
          }
        }
        functionDeclaration.body = new BlockStatement(block)
      } else {
        throw new ParserError(
          `Expected LEFT_BRACE but got ${TokenType[tokens[0].type]}`,
          {
            line: tokens[0].line,
            column: tokens[0].column,
          }
        )
      }
      return functionDeclaration
    } else if (tokens[0].type === TokenType.RETURN) {
      tokens.splice(0, 1)
      return new ReturnStatement(parse(tokens))
    } else if (tokens[0].type === TokenType.LEFT_BRACKET) {
      const elements = []
      tokens.splice(0, 1)
      let i = 0
      let leftBrackets = 1
      while (leftBrackets > 0) {
        if (tokens[i].type === TokenType.LEFT_BRACKET) {
          leftBrackets += 1
        }
        if (tokens[i].type === TokenType.RIGHT_BRACKET) {
          leftBrackets -= 1
        }
        i += 1
      }
      const elementsTokens = tokens.splice(0, i)

      let node
      while (elementsTokens.length > 0) {
        try {
          if (elementsTokens[0].type === TokenType.COMMA) {
            elementsTokens.splice(0, 1)
          }
          node = parse(elementsTokens)
        } catch (err) {
          console.log(err)
          break
        }
        elements.push(node)
      }
      return new ArrayExpression(elements)
    } else if (tokens[0].type === TokenType.ENUM) {
      if (tokens[1].type !== TokenType.IDENTIFIER) {
        throw new ParserError(
          `Expected IDENTIFIER but got ${TokenType[tokens[1].type]}`,
          {
            line: tokens[1].line,
            column: tokens[1].column,
          }
        )
      }
      const enumName = new Identifier(tokens[1].value)
      if (tokens[2].type === TokenType.LEFT_BRACE) {
        tokens.splice(0, 3)
        let i = 0
        let leftBraces = 1
        while (leftBraces > 0) {
          if (tokens[i].type === TokenType.LEFT_BRACE) {
            leftBraces += 1
          }
          if (tokens[i].type === TokenType.RIGHT_BRACE) {
            leftBraces -= 1
          }
          i += 1
        }
        const enumTokens = tokens.splice(0, i)

        const members = []
        let node
        while (enumTokens.length > 0) {
          try {
            if (enumTokens[0].type === TokenType.COMMA) {
              enumTokens.splice(0, 1)
            }
            node = parse(enumTokens)
          } catch (err) {
            console.log(err)
            break
          }
          if (node.$type === 'Identifier') {
            members.push(new EnumMember(node as Identifier))
          } else if (
            node.$type === 'ExpressionStatement' &&
            (node as ExpressionStatement).expression.$type ===
              'AssignmentExpression'
          ) {
            const assignment = (node as ExpressionStatement)
              .expression as AssignmentExpression
            if (assignment.left.$type !== 'Identifier') {
              throw new ParserError(
                'Left side of assignment expression must be an Identifier',
                {
                  line: tokens[0].line,
                  column: tokens[0].column,
                }
              )
            }
            if (assignment.operator !== '=') {
              throw new ParserError(
                'The only operator allowed is the assignment operator',
                {
                  line: tokens[0].line,
                  column: tokens[0].column,
                }
              )
            }
            if (
              assignment.right.$type !== 'NumericLiteral' &&
              assignment.right.$type !== 'StringLiteral'
            ) {
              throw new ParserError(
                'The only allowed values are a numeric literal and a string literal',
                {
                  line: tokens[0].line,
                  column: tokens[0].column,
                }
              )
            }
            members.push(
              new EnumMember(assignment.left as Identifier, assignment.right)
            )
          } else {
            throw new ParserError(
              'Enum members must be either an Identifier or ' +
                'an ExpressionStatement with expression AssignmentExpression',
              {
                line: tokens[0].line,
                column: tokens[0].column,
              }
            )
          }
        }
        return new EnumDeclaration(enumName, members)
      } else {
        throw new ParserError(
          `Expected LEFT_BRACE but got ${TokenType[tokens[2].type]}`,
          {
            line: tokens[2].line,
            column: tokens[2].column,
          }
        )
      }
    } else if (tokens[0].type === TokenType.LEFT_BRACE) {
      tokens.splice(0, 1)
      const properties: ObjectProperty[] = []
      let i = 0
      let leftBrace = 1
      while (leftBrace > 0) {
        if (tokens[i].type === TokenType.LEFT_BRACE) {
          leftBrace += 1
        }
        if (tokens[i].type === TokenType.RIGHT_BRACE) {
          leftBrace -= 1
        }
        i += 1
      }
      const propertiesTokens = tokens.splice(0, i)

      let node: ObjectProperty
      while (propertiesTokens.length > 0) {
        try {
          if (propertiesTokens[0].type === TokenType.COMMA) {
            propertiesTokens.splice(0, 1)
          }
          if (propertiesTokens[0].type === TokenType.RIGHT_BRACE) {
            propertiesTokens.splice(0, 1)
            continue
          }
          if (propertiesTokens[0].type === TokenType.IDENTIFIER) {
            const propertyKey = new Identifier(propertiesTokens[0].value)
            if (propertiesTokens[1].type === TokenType.COLON) {
              propertiesTokens.splice(0, 2)
              node = new ObjectProperty(propertyKey, parse(propertiesTokens))
            } else if (
              propertiesTokens[1].type === TokenType.COMMA ||
              propertiesTokens[1].type === TokenType.RIGHT_BRACE
            ) {
              propertiesTokens.splice(0, 1)
              node = new ObjectProperty(propertyKey, propertyKey, true)
            } else {
              throw new ParserError(
                `Expected COLON but got ${TokenType[propertiesTokens[1].type]}`,
                {
                  line: propertiesTokens[1].line,
                  column: propertiesTokens[1].column,
                }
              )
            }
          } else {
            throw new ParserError(
              `Expected IDENTIFIER but got ${
                TokenType[propertiesTokens[0].type]
              }`,
              {
                line: propertiesTokens[0].line,
                column: propertiesTokens[0].column,
              }
            )
          }
        } catch (err) {
          console.log(err)
          break
        }
        properties.push(node)
      }
      return new ObjectExpression(properties)
    }
  throw new Error('End')
  return new Node()
}
