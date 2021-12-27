import Token from '../types/Token'
import { isPrimitiveType, TokenType } from '../types/TokenType'
import Node from '../AST/Node'
import Identifier from '../AST/Identifier'
import Program from '../AST/Program'
import VariableDeclaration, { VariableKind } from '../AST/VariableDeclaration'
import NumericLiteral from '../AST/NumericLiteral'
import BinaryExpression from '../AST/BinaryExpression'
import CallExpression from '../AST/CallExpression'
import ParserError from './errors/ParserError'
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
import UnaryExpression from '../AST/UnaryExpression'
import BooleanLiteral from '../AST/BooleanLiteral'
import Position, { initMinusOne } from '../types/Position'
import ClassDeclaration, { Accessibility } from '../AST/ClassDeclaration'
import NullLiteral from '../AST/NullLiteral'
import ClassMethod from '../AST/ClassMethod'
import ClassProperty from '../AST/ClassProperty'
import TokenString from '../types/TokenString'
import ForOfStatement from '../AST/ForOfStatement'
import ForInStatement from '../AST/ForInStatement'
import ForStatement from '../AST/ForStatement'
import RangeExpression from '../AST/RangeExpression'

export default class Parser {
  private tokens: Token[]
  private current: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  public parse(): Program {
    const nodes: Node[] = []

    while (!this.isAtEnd()) {
      try {
        nodes.push(this.declaration())
      } catch (err) {
        console.log(err)
        break
      }
    }
    const programPosition = initMinusOne()
    if (nodes.length > 0) {
      programPosition.start = nodes[0].$position.start
      programPosition.end = nodes[nodes.length - 1].$position.end
    }
    return new Program(nodes, programPosition)
  }

  private expression(): Node {
    return this.assignment()
  }

  private declaration(): Node {
    if (this.match(TokenType.CONST)) {
      return this.variableDeclaration()
    }
    if (this.match(TokenType.LET)) {
      return this.variableDeclaration()
    }
    if (this.match(TokenType.FUNCTION)) {
      return this.functionDeclaration()
    }
    if (this.match(TokenType.ENUM)) {
      return this.enumDeclaration()
    }
    if (this.match(TokenType.CLASS)) {
      return this.classDeclaration()
    }

    return this.statement()
  }

  private statement(): Node {
    if (this.match(TokenType.FOR)) {
      return this.forStatement()
    }
    if (this.match(TokenType.IF)) {
      return this.ifStatement()
    }
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement()
    }

    return this.expressionStatement()
  }

  private forStatement(): ForStatement | ForOfStatement | ForInStatement {
    const forStmtPosition: Position = this.previous().position

    let initializer
    if (this.match(TokenType.LET) || this.match(TokenType.CONST)) {
      try {
        initializer = this.variableDeclaration()
      } catch (error: any) {
        if (
          error.message === 'Expected ASSIGNMENT but got IN' ||
          error.message === 'Expected ASSIGNMENT but got OF'
        ) {
          initializer = new VariableDeclaration(
            this.tokens[this.current - 2].value as VariableKind,
            new Identifier(
              this.previous().value,
              'any',
              this.previous().position
            ),
            new NullLiteral(this.previous().position),
            {
              start: this.tokens[this.current - 2].position.start,
              end: this.previous().position.end,
            }
          )
        } else {
          throw error
        }
      }
    } else {
      initializer = this.expression()
      if (
        initializer.$type !== 'VariableDeclaration' &&
        initializer.$type !== 'Identifier'
      ) {
        throw new ParserError(
          'Expected VariableDeclaration or Identifier but got ' +
            initializer.$type,
          initializer.$position
        )
      }
    }

    let right
    if (this.match(TokenType.IN)) {
      right = this.expression()
      if (right.$type !== 'ObjectExpression' && right.$type !== 'Identifier') {
        throw new ParserError(
          'Expected ObjectExpression or Identifier but got ' + right.$type,
          right.$position
        )
      }

      this.consume(TokenType.LEFT_BRACE)
      let body = this.blockStatement()

      forStmtPosition.end = body.$position.end
      return new ForInStatement(
        initializer as any,
        right as any,
        body.body,
        forStmtPosition
      )
    }
    if (this.match(TokenType.OF)) {
      right = this.expression()
      if (
        right.$type !== 'ArrayExpression' &&
        right.$type !== 'RangeExpression' &&
        right.$type !== 'StringLiteral' &&
        right.$type !== 'Identifier'
      ) {
        throw new ParserError(
          'Expected ArrayExpression, StringLiteral or Identifier but got ' +
            right.$type,
          right.$position
        )
      }

      this.consume(TokenType.LEFT_BRACE)
      let body = this.blockStatement()

      forStmtPosition.end = body.$position.end
      return new ForOfStatement(
        initializer as any,
        right as any,
        body.body,
        forStmtPosition
      )
    }
    this.consume(TokenType.SEMI_COLON)

    let condition = null
    if (!this.check(TokenType.SEMI_COLON)) {
      condition = this.expression()
    }
    this.consume(TokenType.SEMI_COLON)

    let update = null
    if (!this.check(TokenType.LEFT_BRACE)) {
      update = this.expression()
    }

    this.consume(TokenType.LEFT_BRACE)
    let body = this.blockStatement()

    if (condition === null) {
      condition = new BooleanLiteral(true, initMinusOne())
    }

    return new ForStatement(
      initializer as any,
      condition as BinaryExpression,
      update as AssignmentExpression,
      body.body,
      forStmtPosition
    )
  }

  private ifStatement(): IfStatement {
    const ifStmtPosition: Position = this.previous().position

    this.consume(TokenType.LEFT_PARENTHESIS)
    const condition: Node = this.expression()
    this.consume(TokenType.RIGHT_PARENTHESIS)

    this.consume(TokenType.LEFT_BRACE)
    const consequentBlock: BlockStatement = this.blockStatement()
    ifStmtPosition.end = consequentBlock.$position.end
    let alternateBlock: BlockStatement | IfStatement | undefined = undefined
    if (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.IF)) {
        alternateBlock = this.ifStatement()
      } else {
        this.consume(TokenType.LEFT_BRACE)
        alternateBlock = this.blockStatement()
      }
      if (alternateBlock) {
        ifStmtPosition.end = alternateBlock.$position.end
      }
    }

    return new IfStatement(
      condition,
      consequentBlock,
      alternateBlock,
      ifStmtPosition
    )
  }

  private returnStatement(): ReturnStatement {
    const returnStmtPosition = this.previous().position

    let value: Node | undefined = undefined
    if (!this.check(TokenType.SEMI_COLON)) {
      value = this.expression()
      if (value) {
        returnStmtPosition.end = value.$position.end
      }
    } else {
      this.consume(TokenType.SEMI_COLON)
    }

    return new ReturnStatement(value, returnStmtPosition)
  }

  private blockStatement(): BlockStatement {
    const statements: Node[] = []

    while (!this.check(TokenType.RIGHT_BRACE) /* TODO: check if not end*/) {
      statements.push(this.declaration())
    }

    this.consume(TokenType.RIGHT_BRACE)

    const blockPosition = initMinusOne()
    if (statements.length > 0) {
      blockPosition.start = statements[0].$position.start
      blockPosition.end = statements[statements.length - 1].$position.end
    }
    return new BlockStatement(statements, blockPosition)
  }

  private expressionStatement() {
    const expr = this.expression()
    return expr
  }

  private assignment(): Node {
    const expr = this.or()

    if (
      this.match(
        TokenType.ASSIGNMENT,
        TokenType.ADDITION_ASSIGNMENT,
        TokenType.SUBTRACTION_ASSIGNMENT,
        TokenType.MULTIPLICATION_ASSIGNMENT,
        TokenType.DIVISION_ASSIGNMENT,
        TokenType.MODULUS_ASSIGNMENT,
        TokenType.POWER_ASSIGNMENT
      )
    ) {
      const operator: Token = this.previous(),
        value = this.assignment()
      return new AssignmentExpression(expr, operator.value, value, {
        start: expr.$position.start,
        end: value.$position.end,
      })
    }

    return expr
  }

  private or(): Node {
    let expr: Node = this.and()

    while (this.match(TokenType.OR)) {
      const operator = this.previous(),
        right: Node = this.and()
      expr = new BinaryExpression(expr, operator.value, right, {
        start: expr.$position.start,
        end: right.$position.end,
      })
    }

    return expr
  }

  private and(): Node {
    let expr: Node = this.equality()
    while (this.match(TokenType.AND)) {
      const operator = this.previous(),
        right: Node = this.equality()
      expr = new BinaryExpression(expr, operator.value, right, {
        start: expr.$position.start,
        end: right.$position.end,
      })
    }

    return expr
  }

  private equality(): Node {
    let expr: Node = this.comparison()

    while (this.match(TokenType.NOT_EQUAL, TokenType.EQUAL)) {
      const operator = this.previous(),
        right: Node = this.comparison()
      expr = new BinaryExpression(expr, operator.value, right, {
        start: expr.$position.start,
        end: right.$position.end,
      })
    }

    return expr
  }

  private comparison(): Node {
    let expr: Node = this.term()

    while (
      this.match(
        TokenType.GREATER_THAN,
        TokenType.GREATER_THAN_OR_EQUAL,
        TokenType.LESS_THAN,
        TokenType.LESS_THAN_OR_EQUAL
      )
    ) {
      const operator = this.previous(),
        right = this.term()
      expr = new BinaryExpression(expr, operator.value, right, {
        start: expr.$position.start,
        end: right.$position.end,
      })
    }

    return expr
  }

  private term(): Node {
    let expr = this.factor()

    while (this.match(TokenType.SUBTRACTION, TokenType.ADDITION)) {
      const operator = this.previous(),
        right = this.factor()
      expr = new BinaryExpression(expr, operator.value, right, {
        start: expr.$position.start,
        end: right.$position.end,
      })
    }

    return expr
  }

  private factor(): Node {
    let expr = this.unary()

    while (this.match(TokenType.DIVISION, TokenType.MULTIPLICATION)) {
      const operator = this.previous(),
        right = this.unary()
      expr = new BinaryExpression(expr, operator.value, right, {
        start: expr.$position.start,
        end: right.$position.end,
      })
    }

    return expr
  }

  private unary(): Node {
    while (this.match(TokenType.NOT, TokenType.SUBTRACTION)) {
      const operator = this.previous(),
        right = this.unary()
      return new UnaryExpression(operator.value, right, {
        start: operator.position.start,
        end: right.$position.end,
      })
    }

    return this.call()
  }

  private call(): Node {
    let expr: Node = this.primary()

    while (true) {
      if (this.match(TokenType.LEFT_PARENTHESIS)) {
        expr = this.finishCall(expr as Identifier)
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER)
        expr = new MemberExpression(
          expr,
          new Identifier(name.value, 'any', name.position),
          { start: expr.$position.start, end: name.position.end }
        )
      } else {
        break
      }
    }

    return expr
  }

  private finishCall(callee: Identifier): Node {
    const args: Node[] = []

    if (!this.check(TokenType.RIGHT_PARENTHESIS)) {
      do {
        if (args.length >= 255) {
          throw new ParserError(
            "Can't have more that 255 arguments.",
            this.peek().position
          )
        }
        args.push(this.expression())
      } while (this.match(TokenType.COMMA))
    }

    this.consume(TokenType.RIGHT_PARENTHESIS)

    return new CallExpression(callee, args, {
      start: callee.$position.start,
      end: this.previous().position.end,
    })
  }

  private primary(): Node {
    if (this.match(TokenType.FALSE)) {
      return new BooleanLiteral(false, this.previous().position)
    }
    if (this.match(TokenType.TRUE)) {
      return new BooleanLiteral(true, this.previous().position)
    }
    if (this.match(TokenType.NULL)) {
      return new NullLiteral(this.previous().position)
    }

    if (this.match(TokenType.INTEGER, TokenType.FLOAT)) {
      return new NumericLiteral(
        this.previous().type === TokenType.INTEGER
          ? parseInt(this.previous().value)
          : parseFloat(this.previous().value),
        this.previous().position
      )
    }

    if (this.match(TokenType.STRING)) {
      return new StringLiteral(this.previous().value, this.previous().position)
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Identifier(
        this.previous().value,
        'any',
        this.previous().position
      )
    }

    if (this.match(TokenType.LEFT_PARENTHESIS)) {
      const parenStmtPosition: Position = this.previous().position
      const expr = this.expression()
      this.consume(TokenType.RIGHT_PARENTHESIS)
      parenStmtPosition.end = this.previous().position.end

      return new ParenthesisStatement(expr, parenStmtPosition)
    }

    if (this.match(TokenType.LEFT_BRACE)) {
      const objectExprPosition: Position = this.previous().position
      const properties: ObjectProperty[] = []
      if (!this.check(TokenType.RIGHT_BRACE)) {
        do {
          properties.push(this.objectProperty())
        } while (
          this.match(TokenType.COMMA) &&
          !this.check(TokenType.RIGHT_BRACE)
        )
      }
      this.consume(TokenType.RIGHT_BRACE)
      objectExprPosition.end = this.previous().position.end

      return new ObjectExpression(properties, objectExprPosition)
    }

    if (this.match(TokenType.LEFT_BRACKET)) {
      let isArray: boolean = true
      const exprPosition: Position = this.previous().position
      const elements: Node[] = []
      if (!this.check(TokenType.RIGHT_BRACKET)) {
        do {
          elements.push(this.expression())
        } while (
          this.match(TokenType.COMMA) &&
          !this.check(TokenType.RIGHT_BRACKET)
        )
      }

      try {
        this.consume(TokenType.RIGHT_BRACKET)
      } catch (error: any) {
        if (error.message === 'Expected RIGHT_BRACKET but got DOUBLE_DOT') {
          isArray = false
          this.advance()
          if (!this.check(TokenType.RIGHT_BRACKET)) {
            do {
              elements.push(this.expression())
            } while (
              this.match(TokenType.DOUBLE_DOT) &&
              !this.check(TokenType.RIGHT_BRACKET)
            )
          }
          this.consume(TokenType.RIGHT_BRACKET)
        } else {
          throw error
        }
      }

      exprPosition.end = this.previous().position.end

      if (isArray) {
        return new ArrayExpression(elements, exprPosition)
      } else {
        if (elements.length === 2) {
          return new RangeExpression(
            elements[0] as NumericLiteral,
            new NumericLiteral(1, initMinusOne()),
            elements[1] as NumericLiteral,
            exprPosition
          )
        } else if (elements.length === 3) {
          return new RangeExpression(
            elements[0] as NumericLiteral,
            elements[1] as NumericLiteral,
            elements[2] as NumericLiteral,
            exprPosition
          )
        } else {
          throw new ParserError(
            'Expected 2 or 3 elements in RangeExpression but got ' +
              elements.length +
              ', ' +
              elements,
            exprPosition
          )
        }
      }
    }

    throw new ParserError('Expected expression.', this.peek().position)
  }

  private objectProperty(): ObjectProperty {
    const propertyName = new Identifier(
        this.consume(TokenType.IDENTIFIER).value,
        'any',
        this.previous().position
      ),
      value = propertyName
    if (!this.check(TokenType.COMMA)) {
      this.consume(TokenType.COLON)
      const expr = this.expression()
      return new ObjectProperty(propertyName, expr, false, {
        start: propertyName.$position.start,
        end: expr.$position.end,
      })
    }
    return new ObjectProperty(
      propertyName,
      propertyName,
      true,
      propertyName.$position
    )
  }

  private identifier(): Identifier {
    const identifier: Identifier = new Identifier(
      this.previous().value,
      'any',
      this.previous().position
    )

    if (this.match(TokenType.COLON)) {
      if (this.check(TokenType.IDENTIFIER) || isPrimitiveType(this.peek())) {
        identifier.typeAnnotation = this.peek().value
        identifier.$position.end = this.peek().position.end
        // skip IDENTIFIER or PRIMITIVE_TYPE token
        this.advance()
      } else {
        throw new ParserError(
          'Expected IDENTIFIER or PRIMITIVE_TYPE ' +
            '(Boolean, Integer, Float, String) but got ' +
            TokenType[this.peek().type],
          this.peek().position
        )
      }
    }

    return identifier
  }

  private variableDeclaration(): VariableDeclaration {
    // set start position
    const varDeclPosition: Position = this.previous().position,
      // get variable  kind (CONST or LET)
      kind: VariableKind = this.previous().value as VariableKind

    // check if token is of type IDENTIFIER
    this.consume(TokenType.IDENTIFIER)
    const identifier: Identifier = this.identifier()

    // expect ASSIGNMENT token
    this.consume(TokenType.ASSIGNMENT)

    // parse initializer
    const initializer: Node = this.expression()

    // expand variable declaration position by initializer position
    varDeclPosition.end = initializer.$position.end

    return new VariableDeclaration(
      kind,
      identifier,
      initializer,
      varDeclPosition
    )
  }

  private functionDeclaration(): FunctionDeclaration {
    const funcDeclPosition: Position = this.previous().position,
      identifier = new Identifier(
        this.consume(TokenType.IDENTIFIER).value,
        'any',
        this.previous().position
      )

    this.consume(TokenType.LEFT_PARENTHESIS)
    const parameters: Identifier[] = []
    if (!this.check(TokenType.RIGHT_PARENTHESIS)) {
      do {
        if (parameters.length >= 255) {
          throw new ParserError(
            "Function can't have more that 255 parameters.",
            this.peek().position
          )
        }

        this.consume(TokenType.IDENTIFIER)
        const identifier: Identifier = this.identifier()
        parameters.push(identifier)
      } while (this.match(TokenType.COMMA))
    }
    this.consume(TokenType.RIGHT_PARENTHESIS)

    let returnType = 'any'
    if (this.match(TokenType.COLON)) {
      if (
        this.check(TokenType.IDENTIFIER) ||
        isPrimitiveType(this.peek()) ||
        this.check(TokenType.VOID_TYPE)
      ) {
        returnType = TokenString[this.peek().type]
        // skip IDENTIFIER, PRIMITIVE_TYPE or VOID_TYPE token
        this.advance()
      } else {
        throw new ParserError(
          'Expected IDENTIFIER or PRIMITIVE_TYPE ' +
            '(Boolean, Integer, Float, String, Void) but got ' +
            TokenType[this.peek().type],
          this.peek().position
        )
      }
    }

    this.consume(TokenType.LEFT_BRACE)
    const blockBody: BlockStatement = this.blockStatement()
    funcDeclPosition.end = blockBody.$position.end

    return new FunctionDeclaration(
      identifier,
      parameters,
      blockBody,
      returnType,
      funcDeclPosition
    )
  }

  private enumMember(): EnumMember {
    const propertyName = new Identifier(
      this.consume(TokenType.IDENTIFIER).value,
      'any',
      this.previous().position
    )
    let expr = undefined
    if (!this.check(TokenType.COMMA)) {
      this.consume(TokenType.ASSIGNMENT)
      expr = this.expression()
    }
    return new EnumMember(propertyName, expr, {
      start: propertyName.$position.start,
      end: expr ? expr.$position.end : propertyName.$position.end,
    })
  }

  private enumDeclaration(): EnumDeclaration {
    const enumDeclPosition: Position = this.previous().position,
      identifier = new Identifier(
        this.consume(TokenType.IDENTIFIER).value,
        'any',
        this.previous().position
      )

    this.consume(TokenType.LEFT_BRACE)
    const members: EnumMember[] = []
    if (!this.check(TokenType.RIGHT_BRACE)) {
      do {
        members.push(this.enumMember())
      } while (
        this.match(TokenType.COMMA) &&
        !this.check(TokenType.RIGHT_BRACE)
      )
    }
    this.consume(TokenType.RIGHT_BRACE)
    enumDeclPosition.end = this.previous().position.end

    return new EnumDeclaration(identifier, members, enumDeclPosition)
  }

  private classDeclaration(): ClassDeclaration {
    const classDeclPosition = this.previous().position
    const classNameToken = new Identifier(
      this.consume(TokenType.IDENTIFIER).value,
      'any',
      this.previous().position
    )

    let superClass: Identifier | undefined
    if (this.match(TokenType.EXTENDS)) {
      superClass = new Identifier(
        this.consume(TokenType.IDENTIFIER).value,
        'any',
        this.previous().position
      )
    }

    this.consume(TokenType.LEFT_BRACE)
    const constructors: ClassMethod[] = [],
      methods: ClassMethod[] = [],
      properties: ClassProperty[] = []
    while (!this.check(TokenType.RIGHT_BRACE)) {
      const methodPropertyPosition: Position = this.consume(
        TokenType.IDENTIFIER
      ).position
      let methodPropertyNameToken: Token = this.previous(),
        accessibility: Accessibility = 'public',
        isAccessibilitySet: boolean = false,
        isStatic: boolean = false,
        isStaticSet: boolean = false,
        staticTokenPosition: Position = initMinusOne(),
        readonly: boolean = false,
        isReadonlySet: boolean = false,
        readonlyTokenPosition: Position = initMinusOne()
      while (this.check(TokenType.IDENTIFIER)) {
        if (
          this.previous().value === 'public' ||
          this.previous().value === 'protected' ||
          this.previous().value === 'private'
        ) {
          if (isAccessibilitySet) {
            throw new ParserError(
              'Accessibility modifier already set.',
              this.previous().position
            )
          } else {
            accessibility = this.previous().value as Accessibility
            methodPropertyNameToken = this.consume(TokenType.IDENTIFIER)
            isAccessibilitySet = true
          }
        }
        if (this.previous().value === 'static') {
          if (isStaticSet) {
            throw new ParserError(
              "'static' modifier already set.",
              this.previous().position
            )
          } else {
            isStatic = true
            staticTokenPosition = { ...this.previous().position }
            methodPropertyNameToken = this.consume(TokenType.IDENTIFIER)
            isStaticSet = true
          }
        }
        if (this.previous().value === 'readonly') {
          if (isReadonlySet) {
            throw new ParserError(
              "'readonly' modifier already set.",
              this.previous().position
            )
          } else {
            readonly = true
            readonlyTokenPosition = { ...this.previous().position }
            methodPropertyNameToken = this.consume(TokenType.IDENTIFIER)
            isReadonlySet = true
          }
        }
      }
      if (this.match(TokenType.LEFT_PARENTHESIS)) {
        const parameters: Identifier[] = []
        if (!this.check(TokenType.RIGHT_PARENTHESIS)) {
          do {
            if (parameters.length >= 255) {
              throw new ParserError(
                "Function can't have more that 255 parameters.",
                this.peek().position
              )
            }

            this.consume(TokenType.IDENTIFIER)
            const identifier: Identifier = this.identifier()
            parameters.push(identifier)
          } while (this.match(TokenType.COMMA))
        }
        this.consume(TokenType.RIGHT_PARENTHESIS)

        let returnType = TokenType.VOID_TYPE
        if (this.match(TokenType.COLON)) {
          if (
            this.check(TokenType.IDENTIFIER) ||
            isPrimitiveType(this.peek()) ||
            this.check(TokenType.VOID_TYPE)
          ) {
            returnType = this.peek().type
            // skip IDENTIFIER, PRIMITIVE_TYPE or VOID_TYPE token
            this.advance()
          } else {
            throw new ParserError(
              'Expected IDENTIFIER or PRIMITIVE_TYPE ' +
                '(Boolean, Integer, Float, String, Void) but got ' +
                TokenType[this.peek().type],
              this.peek().position
            )
          }
        }

        this.consume(TokenType.LEFT_BRACE)
        const blockBody: BlockStatement = this.blockStatement()
        methodPropertyPosition.end = blockBody.$position.end

        if (methodPropertyNameToken.value === 'constructor') {
          if (isStatic && isStaticSet) {
            throw new ParserError(
              "'static' modifier cannot appear on a constructor declaration.",
              staticTokenPosition
            )
          }
          if (readonly && isReadonlySet) {
            throw new ParserError(
              "'readonly' modifier cannot appear on a constructor declaration.",
              readonlyTokenPosition
            )
          }
          constructors.push(
            new ClassMethod(
              new Identifier(
                methodPropertyNameToken.value,
                'any',
                methodPropertyNameToken.position
              ),
              parameters,
              blockBody,
              isStatic,
              accessibility,
              methodPropertyNameToken.value,
              returnType,
              methodPropertyPosition
            )
          )
        } else if (methodPropertyNameToken.value === 'method') {
          methods.push(
            new ClassMethod(
              new Identifier(
                methodPropertyNameToken.value,
                'any',
                methodPropertyNameToken.position
              ),
              parameters,
              blockBody,
              isStatic,
              accessibility,
              methodPropertyNameToken.value,
              returnType,
              methodPropertyPosition
            )
          )
        }
      } else if (this.match(TokenType.ASSIGNMENT)) {
        const value = this.assignment()
        methodPropertyPosition.end = value.$position.end
        properties.push(
          new ClassProperty(
            new Identifier(
              methodPropertyNameToken.value,
              'any',
              methodPropertyNameToken.position
            ),
            value,
            isStatic,
            readonly,
            accessibility,
            methodPropertyPosition
          )
        )
      }
    }
    this.consume(TokenType.RIGHT_BRACE)
    classDeclPosition.end = this.previous().position.end

    return new ClassDeclaration(
      classNameToken,
      superClass,
      constructors,
      properties,
      methods,
      classDeclPosition
    )
  }

  /**
   * Checks if current token is of given type
   */
  private check(tokenType: TokenType): boolean {
    return this.peek().type === tokenType
  }

  /**
   * Increments index of current token and returns previous token
   */
  private advance(): Token {
    if (this.current < this.tokens.length - 1) {
      this.current += 1
    }
    return this.previous()
  }

  /**
   * Checks if current token is last
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.TOK_LAST
  }

  /**
   *
   * Returns current token
   */
  private peek(): Token {
    return this.tokens[this.current]
  }

  /**
   * Returns previous token
   */
  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  /**
   * Checks if current token is of given type and
   * if condition is true increments index of current token
   * and returns previous token (current)
   * otherwise throws error about expected token
   *
   * @throws {ParserError}
   */
  private consume(tokenType: TokenType, errorMessage?: string): Token {
    if (this.check(tokenType)) {
      return this.advance()
    }
    throw new ParserError(
      errorMessage ||
        `Expected ${TokenType[tokenType]} but got ${
          TokenType[this.peek().type]
        }`,
      this.peek().position
    )
  }

  /**
   * Checks if current token is of given types and if condition is true
   * increments index of current token
   */
  private match(...types: TokenType[]): boolean {
    for (let i = 0; i < types.length; i++) {
      if (this.check(types[i])) {
        this.advance()
        return true
      }
    }

    return false
  }
}
