const {Command, flags} = require('@oclif/command')
const path = require('path')
const midwife = require('midwife')

class MidwifeCliCommand extends Command {
  async run() {
    const {flags} = this.parse(MidwifeCliCommand)
    const {file} = flags
    const fileName = path.resolve(process.cwd(), file)
    const config = require(fileName)
    midwife.build(config)
  }
}

MidwifeCliCommand.description = `Build a Midwife site using a CLI
`

MidwifeCliCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  file: flags.string({char: 'f', description: 'Build config to use', default: 'midwife.config.js'}),
}

module.exports = MidwifeCliCommand
