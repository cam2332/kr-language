import Token from '../types/Token'
import {
  isOperator,
  isAssignOperator,
  isPrimitiveType,
  TokenType,
  compareOperatorPriority,
  isUnaryOperator,
  isBooleanLiteral,
} from '../types/TokenType'
import Node from '../AST/Node'
import Identifier from '../AST/Identifier'
import Program from '../AST/Program'
import VariableDeclaration, { VariableKind } from '../AST/VariableDeclaration'
import NumericLiteral from '../AST/NumericLiteral'
import BinaryExpression from '../AST/BinaryExpression'
import CallExpression from '../AST/CallExpression'
import ParserError from './errors/ParserError'
import ExpressionStatement from '../AST/ExpressionStatement'
import AssignmentExpression from '../AST/AssignmentExpression'
import FunctionDeclaration from '../AST/FunctionDeclaration'
import BlockStatement from '../AST/BlockStatement'
import ParenthesisStatement from '../AST/ParenthesisStatement'
import ReturnStatement from '../AST/ReturnStatement'
import ArrayExpression from '../AST/ArrayExpression'
import MemberExpression from '../AST/MemberExpression'
import StringLiteral from '../AST/StringLiteral'
import EnumDeclaration from '../AST/EnumDeclaration'
import EnumMember from '../AST/EnumMember'
import ObjectProperty from '../AST/ObjectProperty'
import ObjectExpression from '../AST/ObjectExpression'
import IfStatement from '../AST/IfStatement'
import { getTokensBetweenTokens } from './utils/ParserUtils'
import UnaryExpression from '../AST/UnaryExpression'
import BooleanLiteral from '../AST/BooleanLiteral'

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
            start: tokens[1].start,
            end: tokens[1].end,
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
              start: tokens[3].start,
              end: tokens[3].end,
            }
          )
        }
      }
      if (tokens[2].type !== TokenType.ASSIGNMENT) {
        throw new ParserError(
          `Expected ASSIGNMENT '=' but got ${TokenType[tokens[2].type]}`,
          {
            start: tokens[2].start,
            end: tokens[2].end,
          }
        )
      }

      tokens.splice(0, 3)

      return new VariableDeclaration(kind, identifier, parse(tokens))
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
      if (tokens.length > 0 && isOperator(tokens[0])) {
        return operatorPrecedence(tokens, left)
      } else {
        return left
      }
    } else if (tokens[0].type === TokenType.STRING) {
      const left = new StringLiteral(tokens[0].value)
      tokens.splice(0, 1)
      if (tokens.length > 0 && isOperator(tokens[0])) {
        return operatorPrecedence(tokens, left)
      } else {
        return left
      }
    } else if (isUnaryOperator(tokens[0])) {
      const operator = tokens[0].value
      tokens.splice(0, 1)
      return new UnaryExpression(operator, parse(tokens))
    } else if (isBooleanLiteral(tokens[0])) {
      const value = tokens[0].value === 'true'
      tokens.splice(0, 1)
      return new BooleanLiteral(value)
    } else if (tokens[0].type === TokenType.IDENTIFIER) {
      const callee = new Identifier(tokens[0].value)
      if (tokens.length > 1 && tokens[1].type === TokenType.LEFT_PARENTHESIS) {
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
          argsTokens.pop()

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
        if (tokens.length > 0 && isOperator(tokens[0])) {
          return operatorPrecedence(tokens, new CallExpression(callee, args))
        }
        // @ts-ignore
        if (tokens.length > 0 && tokens[0].type === TokenType.DOT) {
          tokens.splice(0, 1)
          return new MemberExpression(
            new CallExpression(callee, args),
            parse(tokens)
          )
        }
        return new CallExpression(callee, args)
      } else if (tokens.length > 1 && isOperator(tokens[1])) {
        tokens.splice(0, 1)
        return operatorPrecedence(tokens, callee)
      } else if (tokens.length > 1 && isAssignOperator(tokens[1])) {
        const operator = tokens[1].value
        tokens.splice(0, 2)
        return new ExpressionStatement(
          new AssignmentExpression(callee, operator, parse(tokens))
        )
      } else if (
        tokens.length > 1 &&
        tokens[1].type === TokenType.LEFT_BRACKET
      ) {
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
      } else if (tokens.length > 1 && tokens[1].type === TokenType.DOT) {
        tokens.splice(0, 2)
        return new MemberExpression(callee, parse(tokens))
      } else if (tokens.length > 1 && tokens[1].type === TokenType.COLON) {
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
              start: tokens[2].start,
              end: tokens[2].end,
            }
          )
        }
        if (tokens.length > 4 && isAssignOperator(tokens[3])) {
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
      bodyTokens.pop()

      if (isOperator(tokens[0])) {
        return operatorPrecedence(
          tokens,
          new ParenthesisStatement(parse(bodyTokens))
        )
      } else {
        return new ParenthesisStatement(parse(bodyTokens))
      }
    } else if (tokens[0].type === TokenType.FUNCTION) {
      if (tokens[1].type !== TokenType.IDENTIFIER) {
        throw new ParserError(
          `Expected IDENTIFIER but got ${TokenType[tokens[1].type]}`,
          {
            start: tokens[1].start,
            end: tokens[1].end,
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
            start: tokens[2].start,
            end: tokens[2].end,
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
        paramsTokens.pop()

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
              start: tokens[1].start,
              end: tokens[1].end,
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
        blockTokens.pop()

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
            start: tokens[0].start,
            end: tokens[0].end,
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
      elementsTokens.pop()

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
            start: tokens[1].start,
            end: tokens[1].end,
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
        enumTokens.pop()

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
                  start: tokens[0].start,
                  end: tokens[0].end,
                }
              )
            }
            if (assignment.operator !== '=') {
              throw new ParserError(
                'The only operator allowed is the assignment operator',
                {
                  start: tokens[0].start,
                  end: tokens[0].end,
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
                  start: tokens[0].start,
                  end: tokens[0].end,
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
                start: tokens[0].start,
                end: tokens[0].end,
              }
            )
          }
        }
        return new EnumDeclaration(enumName, members)
      } else {
        throw new ParserError(
          `Expected LEFT_BRACE but got ${TokenType[tokens[2].type]}`,
          {
            start: tokens[2].start,
            end: tokens[2].end,
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
                  start: propertiesTokens[1].start,
                  end: propertiesTokens[1].end,
                }
              )
            }
            // if (properties.findIndex((property) => property.key.value === propertyKey.value) !== -1) {
            //   throw new ParserError(
            //     'An ObjectExpression cannot have multiple properties with the same name.',
            //     propertyKey.position
            //   )
            // }
          } else {
            throw new ParserError(
              `Expected IDENTIFIER but got ${
                TokenType[propertiesTokens[0].type]
              }`,
              {
                start: propertiesTokens[0].start,
                end: propertiesTokens[0].end,
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
    } else if (tokens[0].type === TokenType.IF) {
      // Remove 'IF' token
      tokens.splice(0, 1)

      let ifStatement: IfStatement

      // Get tokens between parentheses for test node
      const testTokens = getTokensBetweenTokens(
        tokens,
        TokenType.LEFT_PARENTHESIS,
        TokenType.RIGHT_PARENTHESIS
      )
      // Parse test tokens
      const testNode = parse(testTokens)

      // Get tokens between braces for consequent block
      const consequentTokens = getTokensBetweenTokens(
        tokens,
        TokenType.LEFT_BRACE,
        TokenType.RIGHT_BRACE
      )

      // Parse consequent block tokens
      const consequentBlock: Node[] = []
      let node
      while (consequentTokens.length > 0) {
        node = parse(consequentTokens)
        consequentBlock.push(node)
      }

      // @ts-ignore
      if (tokens[0].type === TokenType.ELSE) {
        // Remove 'ELSE' token
        tokens.splice(0, 1)
        if (tokens[0].type === TokenType.IF) {
          const elseIf = parse(tokens)
          // Check if parsed tokens are of type 'IfStatement'
          if (elseIf.$type === 'IfStatement') {
            return new IfStatement(
              testNode,
              new BlockStatement(consequentBlock),
              elseIf as IfStatement
            )
          } else {
            throw new ParserError(
              `Expected start of 'If statement' but got ${elseIf.$type}`,
              {
                start: tokens[0].start,
                end: tokens[0].end,
              }
            )
          }
        } else {
          // Get tokens between braces for alternative block
          const alternativeTokens = getTokensBetweenTokens(
            tokens,
            TokenType.LEFT_BRACE,
            TokenType.RIGHT_BRACE
          )

          // Parse alternative block tokens
          const alternativeBlock: Node[] = []
          let node
          while (alternativeTokens.length > 0) {
            node = parse(alternativeTokens)
            alternativeBlock.push(node)
          }

          /* return 'If statement' with test node, 
          consequent block and alternative block */
          return new IfStatement(
            testNode,
            new BlockStatement(consequentBlock),
            new BlockStatement(alternativeBlock)
          )
        }
      } else {
        /* If 'ELSE' token doesn't exist return 'If statement' 
           with test node and consequent block
           */
        return new IfStatement(
          testNode,
          new BlockStatement(consequentBlock),
          undefined
        )
      }
    }
    // else if (tokens[0].type === TokenType.CLASS) {

    // }
  }

  console.log(tokens.length, tokens.slice(0, 10))
  throw new ParserError(`End of useable tokens`, {
    start: {
      line: -2,
      column: -2,
    },
    end: {
      line: -2,
      column: -2,
    },
  })
  return new Node()
}

function operatorPrecedence(tokens: Token[], leftArg: Node): BinaryExpression {
  const operator = tokens[0].value
  tokens.splice(0, 1)

  const rightBinaryNode = parse(tokens)
  const opPriority = compareOperatorPriority(
    operator,
    (rightBinaryNode as BinaryExpression).operator
  )
  if (
    rightBinaryNode.$type === 'BinaryExpression' &&
    (opPriority === -1 || opPriority === 0)
  ) {
    return new BinaryExpression(
      new BinaryExpression(
        leftArg,
        operator,
        (rightBinaryNode as BinaryExpression).left
      ),
      (rightBinaryNode as BinaryExpression).operator,
      (rightBinaryNode as BinaryExpression).right
    )
  }
  return new BinaryExpression(leftArg, operator, rightBinaryNode)
}

// function typeCheck(program: Program): Program {

// }

function expectToken(
  target: TokenType,
  value: Token,
  onExpected?: () => void,
  onNotExpected?: () => void
): void {
  if (!value || value.type !== target) {
    return onNotExpected && onNotExpected()
  } else {
    return onExpected && onExpected()
  }
}

function expectOptionalToken(target: TokenType, value: Token): boolean {
  if (!value || value.type !== target) {
    return false
  } else {
    return true
  }
}

function expectOneOfTokens(target: TokenType[], value: Token): number {
  if (target.length > 0) {
    for (let index = 0; index < target.length; index++) {
      const element = target[index]
      if (element === value.type) {
        return index
      }
    }
    throw new ParserError(
      `Expected one of '${target.map(
        (tokenType) => TokenType[tokenType]
      )}' but got ${TokenType[value.type]}`,
      {
        start: value.start,
        end: value.end,
      }
    )
  } else {
    throw new ParserError(`Expected nothing but got ${TokenType[value.type]}`, {
      start: value.start,
      end: value.end,
    })
  }
}
function expectOptionalOneOfTokens(target: TokenType[], value: Token): number {
  if (target.length > 0) {
    for (let index = 0; index < target.length; index++) {
      const element = target[index]
      if (element === value.type) {
        return index
      }
    }
    return -1
  } else {
    return -1
  }
}