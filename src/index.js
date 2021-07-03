const {Command, flags} = require('@oclif/command')
const path = require('path')
const midwife = require('midwife')
const Plugins = require('midwife-core-plugins')
const chokidar = require('chokidar')
const {Server} = require('./server')

const defaultConfig = {
  mode: 'development',
  dataDir: './data',
  viewsDir: './views',
  outDir: './dist',
  refPrefix: '#',
  plugins: Plugins.all,
}

class MidwifeCliCommand extends Command {
  async run() {
    const {flags} = this.parse(MidwifeCliCommand)
    const {file, watch, live, port} = flags
    const fileName = path.resolve(process.cwd(), file)
    let config = defaultConfig
    try {
      config = Object.assign(config, require(fileName))
    } catch (error) {
      console.log(`${file} not found. Building with default configuration.`)
      config = defaultConfig
    }
    async function build() {
      // return boolean to indicate success
      try {
        await midwife.build(config)
        return true
      } catch (error) {
        console.log(`Midwife build failed: ${error}`)
      }
      return false
    }
    const canBuild = await build()
    if (!canBuild) return
    let server
    if (live) {
      server = new Server(config.outDir, port)
    }
    if (watch) {
      const dirs = [path.resolve(process.cwd(), config.dataDir), path.resolve(process.cwd(), config.viewsDir)]
      let running = false
      chokidar.watch(dirs).on('all', () => {
        if (running) return
        running = true
        console.log('Building...')
        build()
        .then(() => {
          running = false
          if (server) server.reload()
          console.log('Waiting for changes...')
        })
      })
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
  live: flags.boolean({char: 'l', description: 'Serve and live reload the output directory', default: false}),
  port: flags.integer({char: 'p', description: 'Port to serve the output directory', default: 8080}),
}

module.exports = MidwifeCliCommand
