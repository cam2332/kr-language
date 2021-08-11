import * as fs from 'fs'
import * as rd from 'readline'
import { tokenize } from './Lexer'
import { mainParse } from './Parser'

const reader = rd.createInterface(
  fs.createReadStream('./resources/testfile.kr')
)

const data = tokenize(reader)

reader.on('close', () => {
  printTokens(data)

  const program = mainParse(data)

  console.log('parser\n', JSON.stringify(program, null, 2))
})
