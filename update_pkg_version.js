const args = process.argv.slice(2)
if (args.length !== 1) {
  console.error('Incorrect number of arguments')
  process.exit(1)
}

let pkg = require('./package.json')
pkg.version = args[0]

console.log('Updating Version ...')
const fs = require('fs')
fs.writeFileSync('./package.json', JSON.stringify(pkg))

pkg = require('./package.json')
console.log('Updated version to: ', pkg.version)
