const {Command, flags} = require('@oclif/command')
const path = require('path')
const midwife = require('midwife')
const Plugins = require('midwife-core-plugins')

class MidwifeCliCommand extends Command {
  async run() {
    const {flags} = this.parse(MidwifeCliCommand)
    const {file} = flags
    const fileName = path.resolve(process.cwd(), file)
    let config
    try {
      config = require(fileName)
    } catch (error) {
      console.log(`${file} not found. Building with default configuration.`)
      config = {
        mode: 'development',
        dataDir: './data',
        viewsDir: './views',
        outDir: './dist',
        refPrefix: '#',
        plugins: Plugins.all,
      }
    }
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
