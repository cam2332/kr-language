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
import Position, { initMinusOne } from '../types/Position'

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
  const programPosition = initMinusOne()
  if (nodes.length > 0) {
    programPosition.start = nodes[0].$position.start
    programPosition.end = nodes[nodes.length - 1].$position.end
  }
  return new Program(nodes, programPosition)
}

export function parse(tokens: Token[]): Node {
  if (tokens.length > 0) {
    if (
      tokens[0].type === TokenType.CONST ||
      tokens[0].type === TokenType.LET
    ) {
      const kind = tokens[0].value as VariableKind
      const varDeclStartPosition = tokens[0].position.start

      if (tokens[1].type !== TokenType.IDENTIFIER) {
        throw new ParserError(
          `Expected IDENTIFIER but got ${TokenType[tokens[1].type]}`,
          tokens[1].position
        )
      }

      const identifier = new Identifier(
        tokens[1].value,
        'any',
        tokens[1].position
      )

      if (tokens[2].type === TokenType.COLON) {
        if (
          tokens[3].type === TokenType.IDENTIFIER ||
          isPrimitiveType(tokens[3])
        ) {
          identifier.typeAnnotation = tokens[3].value
          identifier.$position.end = tokens[3].position.end
          tokens.splice(0, 2)
        } else {
          throw new ParserError(
            `Expected IDENTIFIER or PRIMITIVE_TYPE (Integer, Float, String) but got ${
              TokenType[tokens[3].type]
            }`,
            tokens[3].position
          )
        }
      }
      if (tokens[2].type !== TokenType.ASSIGNMENT) {
        throw new ParserError(
          `Expected ASSIGNMENT '=' but got ${TokenType[tokens[2].type]}`,
          tokens[2].position
        )
      }

      tokens.splice(0, 3)

      const init: Node = parse(tokens)

      const varDeclPosition: Position = {
        start: varDeclStartPosition,
        end: init.$position.end,
      }

      return new VariableDeclaration(kind, identifier, init, varDeclPosition)
    } else if (
      tokens[0].type === TokenType.INTEGER ||
      tokens[0].type === TokenType.FLOAT
    ) {
      const left = new NumericLiteral(
        tokens[0].type === TokenType.INTEGER
          ? parseInt(tokens[0].value)
          : parseFloat(tokens[0].value),
        tokens[0].position
      )
      tokens.splice(0, 1)
      if (tokens.length > 0 && isOperator(tokens[0])) {
        return operatorPrecedence(tokens, left)
      } else {
        return left
      }
    } else if (tokens[0].type === TokenType.STRING) {
      const left = new StringLiteral(tokens[0].value, tokens[0].position)
      tokens.splice(0, 1)
      if (tokens.length > 0 && isOperator(tokens[0])) {
        return operatorPrecedence(tokens, left)
      } else {
        return left
      }
    } else if (isUnaryOperator(tokens[0])) {
      const operatorToken = tokens[0]
      tokens.splice(0, 1)
      const right = parse(tokens)
      return new UnaryExpression(
        operatorToken.value,
        right,
        operatorToken.position
      )
    } else if (isBooleanLiteral(tokens[0])) {
      const valueToken = tokens[0]
      tokens.splice(0, 1)
      return new BooleanLiteral(
        valueToken.value === 'true',
        valueToken.position
      )
    } else if (tokens[0].type === TokenType.IDENTIFIER) {
      const callee = new Identifier(tokens[0].value, 'any', tokens[0].position)
      let exprPosition = callee.$position
      if (tokens.length > 1 && tokens[1].type === TokenType.LEFT_PARENTHESIS) {
        const args = []
        if (tokens[2].type === TokenType.RIGHT_PARENTHESIS) {
          exprPosition.end = tokens[2].position.end
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
          const callExprLastToken = argsTokens.pop()
          if (callExprLastToken) {
            exprPosition.end = callExprLastToken.position.end
          }

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
          return operatorPrecedence(
            tokens,
            new CallExpression(callee, args, exprPosition)
          )
        }
        // @ts-ignore
        if (tokens.length > 0 && tokens[0].type === TokenType.DOT) {
          tokens.splice(0, 1)
          const property = parse(tokens)
          if (
            property.$type === 'Identifier' ||
            property.$type === 'MemberExpression' ||
            property.$type === 'CallExpression'
          ) {
            throw new ParserError(
              "MemberExpression's property must be a member expression, call expression or an identifier",
              property.$position
            )
          }
          const memberExprPosition = {
            start: exprPosition.start,
            end: property.$position.end,
          }
          return new MemberExpression(
            new CallExpression(callee, args, exprPosition),
            property as Identifier | MemberExpression | CallExpression,
            memberExprPosition
          )
        }
        return new CallExpression(callee, args, exprPosition)
      } else if (tokens.length > 1 && isOperator(tokens[1])) {
        tokens.splice(0, 1)
        return operatorPrecedence(tokens, callee)
      } else if (tokens.length > 1 && isAssignOperator(tokens[1])) {
        const operator = tokens[1].value
        tokens.splice(0, 2)
        const assignmentValue = parse(tokens)
        exprPosition.end = assignmentValue.$position.end
        return new ExpressionStatement(
          new AssignmentExpression(
            callee,
            operator,
            assignmentValue,
            exprPosition
          ),
          exprPosition
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
        exprPosition.end =
          propertyTokens[propertyTokens.length - 1].position.end

        try {
          return new MemberExpression(
            callee,
            parse(propertyTokens) as
              | Identifier
              | MemberExpression
              | CallExpression,
            exprPosition
          )
        } catch (err) {
          console.log(err)
        }
      } else if (tokens.length > 1 && tokens[1].type === TokenType.DOT) {
        tokens.splice(0, 2)
        return new MemberExpression(
          callee,
          parse(tokens) as Identifier | MemberExpression | CallExpression,
          exprPosition
        )
      } else if (tokens.length > 1 && tokens[1].type === TokenType.COLON) {
        // TODO: check if this condition (^ with COLON token type ^) is used
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
            tokens[2].position
          )
        }
        if (tokens.length > 4 && isAssignOperator(tokens[3])) {
          const operator = tokens[3].value
          tokens.splice(0, 4)
          return new ExpressionStatement(
            new AssignmentExpression(
              callee,
              operator,
              parse(tokens),
              exprPosition
            ),
            exprPosition
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
      const parenthesisPosition = tokens[0].position
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
      const parenthesisLastToken = bodyTokens.pop()
      if (parenthesisLastToken) {
        parenthesisPosition.end = parenthesisLastToken.position.end
      }

      if (isOperator(tokens[0])) {
        return operatorPrecedence(
          tokens,
          new ParenthesisStatement(parse(bodyTokens), parenthesisPosition)
        )
      } else {
        return new ParenthesisStatement(parse(bodyTokens), parenthesisPosition)
      }
    } else if (tokens[0].type === TokenType.FUNCTION) {
      const funcDeclPosition = tokens[0].position
      if (tokens[1].type !== TokenType.IDENTIFIER) {
        throw new ParserError(
          `Expected IDENTIFIER but got ${TokenType[tokens[1].type]}`,
          tokens[1].position
        )
      }
      const functionDeclaration = new FunctionDeclaration(
        new Identifier(tokens[1].value, 'any', tokens[1].position),
        [],
        undefined,
        TokenType.VOID_TYPE,
        undefined,
        funcDeclPosition
      )
      if (tokens[2].type !== TokenType.LEFT_PARENTHESIS) {
        throw new ParserError(
          `Expected LEFT_PARENTHESIS but got ${TokenType[tokens[2].type]}`,
          tokens[2].position
        )
      }

      if (tokens[3].type === TokenType.RIGHT_PARENTHESIS) {
        funcDeclPosition.end = tokens[3].position.end
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
            tokens[1].position
          )
        }
      }
      // @ts-ignore
      if (tokens[0].type === TokenType.LEFT_BRACE) {
        const blockFirstToken = tokens[0]
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
        const blockLastToken = blockTokens.pop()
        if (blockLastToken) {
          funcDeclPosition.end = blockLastToken.position.end
        }

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
        functionDeclaration.body = new BlockStatement(block, {
          start: blockFirstToken.position.start,
          end: blockLastToken
            ? blockLastToken.position.end
            : blockFirstToken.position.end,
        })
      } else {
        throw new ParserError(
          `Expected LEFT_BRACE but got ${TokenType[tokens[0].type]}`,
          tokens[0].position
        )
      }
      functionDeclaration.$position = funcDeclPosition
      return functionDeclaration
    } else if (tokens[0].type === TokenType.RETURN) {
      const returnStmtStartPosition = tokens[0]
      tokens.splice(0, 1)
      const returnArgument = parse(tokens)
      return new ReturnStatement(returnArgument, {
        start: returnStmtStartPosition.position.start,
        end: returnArgument.$position.end,
      })
    } else if (tokens[0].type === TokenType.LEFT_BRACKET) {
      const arrayExprPosition = tokens[0].position
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
      const lastElementsToken = elementsTokens.pop()
      if (lastElementsToken) {
        arrayExprPosition.end = lastElementsToken.position.end
      }

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
      return new ArrayExpression(elements, arrayExprPosition)
    } else if (tokens[0].type === TokenType.ENUM) {
      const enumDeclarationPosition = tokens[0].position
      if (tokens[1].type !== TokenType.IDENTIFIER) {
        throw new ParserError(
          `Expected IDENTIFIER but got ${TokenType[tokens[1].type]}`,
          tokens[1].position
        )
      }
      const enumName = new Identifier(
        tokens[1].value,
        'any',
        tokens[1].position
      )
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
        const enumLastToken = enumTokens.pop()
        if (enumLastToken) {
          enumDeclarationPosition.end = enumLastToken.position.end
        }

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
            members.push(
              new EnumMember(node as Identifier, undefined, node.$position)
            )
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
                tokens[0].position
              )
            }
            if (assignment.operator !== '=') {
              throw new ParserError(
                'The only operator allowed is the assignment operator',
                tokens[0].position
              )
            }
            if (
              assignment.right.$type !== 'NumericLiteral' &&
              assignment.right.$type !== 'StringLiteral'
            ) {
              throw new ParserError(
                'The only allowed values are a numeric literal and a string literal',
                tokens[0].position
              )
            }
            members.push(
              new EnumMember(
                assignment.left as Identifier,
                assignment.right,
                assignment.$position
              )
            )
          } else {
            throw new ParserError(
              'Enum members must be either an Identifier or ' +
                'an ExpressionStatement with expression AssignmentExpression',
              tokens[0].position
            )
          }
        }
        return new EnumDeclaration(enumName, members, enumDeclarationPosition)
      } else {
        throw new ParserError(
          `Expected LEFT_BRACE but got ${TokenType[tokens[2].type]}`,
          tokens[2].position
        )
      }
    } else if (tokens[0].type === TokenType.LEFT_BRACE) {
      const objectExpressionPosition = tokens[0].position
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
            const propertyKey = new Identifier(
              propertiesTokens[0].value,
              'any',
              propertiesTokens[0].position
            )
            if (propertiesTokens[1].type === TokenType.COLON) {
              propertiesTokens.splice(0, 2)
              const propertyValue = parse(propertiesTokens)
              node = new ObjectProperty(propertyKey, propertyValue, false, {
                start: propertyKey.$position.start,
                end: propertyValue.$position.end,
              })
            } else if (
              propertiesTokens[1].type === TokenType.COMMA ||
              propertiesTokens[1].type === TokenType.RIGHT_BRACE
            ) {
              propertiesTokens.splice(0, 1)
              node = new ObjectProperty(
                propertyKey,
                propertyKey,
                true,
                propertyKey.$position
              )
            } else {
              throw new ParserError(
                `Expected COLON but got ${TokenType[propertiesTokens[1].type]}`,
                propertiesTokens[1].position
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
              propertiesTokens[0].position
            )
          }
        } catch (err) {
          console.log(err)
          break
        }
        properties.push(node)
      }
      return new ObjectExpression(properties, objectExpressionPosition)
    } else if (tokens[0].type === TokenType.IF) {
      const ifStmtPosition = tokens[0].position
      // Remove 'IF' token
      tokens.splice(0, 1)

      // Get tokens between parentheses for test node
      const {
        foundTokens: testTokens,
        endTokenPosition: testEndTokenPosition,
      } = getTokensBetweenTokens(
        tokens,
        TokenType.LEFT_PARENTHESIS,
        TokenType.RIGHT_PARENTHESIS
      )
      // Parse test tokens
      const testNode = parse(testTokens)

      const consequentStartTokenPosition = tokens[0].position
      // Get tokens between braces for consequent block
      const {
        foundTokens: consequentTokens,
        endTokenPosition: consequentEndTokenPosition,
      } = getTokensBetweenTokens(
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
              new BlockStatement(consequentBlock, {
                start: consequentStartTokenPosition.start,
                end: consequentEndTokenPosition.end,
              }),
              elseIf as IfStatement,
              { start: ifStmtPosition.start, end: elseIf.$position.end }
            )
          } else {
            throw new ParserError(
              `Expected start of 'If statement' but got ${elseIf.$type}`,
              tokens[0].position
            )
          }
        } else {
          const alternativeStartTokenPosition = tokens[0].position
          // Get tokens between braces for alternative block
          const {
            foundTokens: alternativeTokens,
            endTokenPosition: alternativeEndTokenPosition,
          } = getTokensBetweenTokens(
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
            new BlockStatement(consequentBlock, {
              start: consequentStartTokenPosition.start,
              end: consequentEndTokenPosition.end,
            }),
            new BlockStatement(alternativeBlock, {
              start: alternativeStartTokenPosition.start,
              end: alternativeEndTokenPosition.end,
            }),
            {
              start: ifStmtPosition.start,
              end: alternativeEndTokenPosition.end,
            }
          )
        }
      } else {
        /* If 'ELSE' token doesn't exist return 'If statement' 
           with test node and consequent block
           */
        return new IfStatement(
          testNode,
          new BlockStatement(consequentBlock, {
            start: consequentStartTokenPosition.start,
            end: consequentEndTokenPosition.end,
          }),
          undefined,
          { start: ifStmtPosition.start, end: consequentEndTokenPosition.end }
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
        (rightBinaryNode as BinaryExpression).left,
        { start: leftArg.$position.start, end: rightBinaryNode.$position.end }
      ),
      (rightBinaryNode as BinaryExpression).operator,
      (rightBinaryNode as BinaryExpression).right,
      {
        start: leftArg.$position.start,
        end: (rightBinaryNode as BinaryExpression).right.$position.end,
      }
    )
  }
  return new BinaryExpression(leftArg, operator, rightBinaryNode, {
    start: leftArg.$position.start,
    end: rightBinaryNode.$position.end,
  })
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
      value.position
    )
  } else {
    throw new ParserError(
      `Expected nothing but got ${TokenType[value.type]}`,
      value.position
    )
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
