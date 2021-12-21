import * as fs from 'fs'
import Node from './AST/Node'
import Program from './AST/Program'
import Interpreter from './Interpreter/Interpreter'
import { tokenize } from './Lexer'
import Parser from './Parser/Parser'
import Token from './types/Token'
import { TokenType } from './types/TokenType'

export default class Kr {
  static debugMode: boolean = false
  static fileName: string
  static fileDir: string
  static sourceFile: string
  private static readonly interpreter: Interpreter = new Interpreter()
  static hadError: boolean = false
  static hadRuntimeError: boolean = false

  constructor(path: string) {
    Kr.fileName = path
      .substring(0, path.lastIndexOf('.'))
      .substring(path.lastIndexOf('/') + 1)

    Kr.fileDir = path
      .substring(0, path.lastIndexOf('.'))
      .substring(0, path.lastIndexOf('/'))
    Kr.runFile(path)
  }

  private static runFile(path: string): void {
    Kr.sourceFile = fs.readFileSync(path, 'utf-8')
    Kr.run(Kr.sourceFile)
  }

  private static run(sourceFile: string): void {
    const tokens: Token[] = tokenize(sourceFile)
    if (this.debugMode) {
      this.writeTokensToFile(tokens)
    }

    const parser: Parser = new Parser(tokens)
    const program: Program = parser.parse()

    if (this.debugMode) {
      this.writeASTToFile(program)
    }

    if (this.hadError) return

    this.interpreter.interpret(program.body)
  }

  private static writeTokensToFile(tokens: Token[]): void {
    try {
      const stream = fs.createWriteStream(
        Kr.fileDir + Kr.fileName + '-tokens' + '.json'
      )
      stream.write('[')
      tokens.forEach((token, index) => {
        stream.write(
          JSON.stringify(
            {
              position: token.position,
              type: TokenType[token.type],
              value: token.value,
            },
            undefined,
            2
          )
        )
        if (index < tokens.length - 1) {
          stream.write(',')
        }
      })
      stream.write(']')
      stream.end()
    } catch (err) {
      console.log(err)
    }
  }

  private static writeASTToFile(ast: Node): void {
    try {
      fs.writeFileSync(
        Kr.fileDir + Kr.fileName + '-parseTree' + '.json',
        JSON.stringify(ast, undefined, 2)
      )
    } catch (err) {
      console.log(err)
    }
  }
}
