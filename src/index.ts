import Kr from './Kr'

const args = process.argv.slice(2)

const inputFilePath = args[0]
if (args[1] && args[1] === 'debugMode') {
  Kr.debugMode = true
}

const kr: Kr = new Kr(inputFilePath)
