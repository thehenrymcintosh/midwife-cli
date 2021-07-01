const {Command, flags} = require('@oclif/command')
const path = require('path')
const midwife = require('midwife')
const Plugins = require('midwife-core-plugins')
const chokidar = require('chokidar');

class MidwifeCliCommand extends Command {
  async run() {
    const {flags} = this.parse(MidwifeCliCommand)
    const {file, watch} = flags
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
    if (watch) {
      const dirs = [path.resolve(process.cwd(), config.dataDir), path.resolve(process.cwd(), config.viewsDir)]
      let running = false;
      chokidar.watch(dirs).on("all", () => {
        if (running) return;
        running = true;
        console.log("Building...")
        midwife.build(config)
        .then(() => {
          running = false;
          console.log("Waiting for changes...")
        })
        .catch( () => {
          running = false;
          console.log("Waiting for changes...")
        })
      })
    } else {
      midwife.build(config)
    }
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
  watch: flags.boolean({char: 'w', description: 'Watch the data and views directory for changes', default: false}),
}

module.exports = MidwifeCliCommand
