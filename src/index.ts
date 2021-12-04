import * as fs from 'fs'
import * as rd from 'readline'
import { TokenType } from './TokenType'
import { tokenize } from './Lexer'
import { mainParse } from './Parser'

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
            line: token.line,
            column: token.column,
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

  const program = mainParse(tokens)

  try {
    fs.writeFileSync(
      inputFileDir + inputFileName + '-parseTree' + '.json',
      JSON.stringify(program, undefined, 2)
    )
  } catch (err) {
    console.log(err)
  }
})
