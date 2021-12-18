import * as fs from 'fs'
import * as rd from 'readline'
import { TokenType } from './types/TokenType'
import { tokenize } from './Lexer'
import Parser from './Parser/Parser'
import Interpreter from './Interpreter/Interpreter'

const args = process.argv.slice(2)

const inputFilePath = args[0]

let inputFileName = inputFilePath
  .substring(0, inputFilePath.lastIndexOf('.'))
  .substring(inputFilePath.lastIndexOf('/') + 1)

let inputFileDir = inputFilePath
  .substring(0, inputFilePath.lastIndexOf('.'))
  .substring(0, inputFilePath.lastIndexOf('/'))

const reader = rd.createInterface(fs.createReadStream(inputFilePath))

const tokens = tokenize(reader)

reader.on('close', () => {
  try {
    const stream = fs.createWriteStream(
      inputFileDir + inputFileName + '-tokens' + '.json'
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

  const parser = new Parser(tokens)
  const program = parser.parse()

  const interpreter: Interpreter = new Interpreter()
  interpreter.interpret(program.body)

  try {
    fs.writeFileSync(
      inputFileDir + inputFileName + '-parseTree' + '.json',
      JSON.stringify(program, undefined, 2)
    )
  } catch (err) {
    console.log(err)
  }
})
