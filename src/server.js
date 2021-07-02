const express = require('express')
const reload = require('reload')
const path = require('path')
const http = require('http')
const logger = require('morgan')
const cheerio = require('cheerio')
const fs = require('fs')

function stripTrailingSlash(str) {
  if (str.substr(-1) === '/') {
    return str.substr(0, str.length - 1)
  }
  return str
}

function stripLeadingSlash(str) {
  if (str.charAt(0) === '/') {
    return str.substr(1, str.length)
  }
  return str
}

function readfile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        reject(err)
      } else {
        const extension = path.extname(filePath)
        resolve({content, extension})
      }
    })
  })
}

function open(rawPath) {
  const filePath = stripTrailingSlash(rawPath)
  return readfile(filePath)
  .catch(() => readfile(`${filePath}.html`))
  .catch(() => readfile(`${filePath}/index.html`))
  .catch(() => ({extension: '', content: undefined}))
}

class Server {
  constructor(staticDir, port) {
    this.serveFiles = this.serveFiles.bind(this)
    this.staticDir = staticDir
    this.port = port
    this.reloadReturned = null
    this.initserver()
    this.server = http.createServer(this.app)
    this.beginReload()
  }

  initserver() {
    this.app = express()
    this.app.set('port', this.port)
    this.app.use(logger('dev'))
    this.app.use(this.serveFiles())
  }

  serveFiles() {
    const {staticDir} = this
    return async (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next()
      const filePath = path.resolve(staticDir, stripLeadingSlash(req.path))
      const {extension, content} = await open(filePath)
      if (!content) return next()
      if (extension === '.html') {
        var $ = cheerio.load(content)
        var scriptNode = '<script src="/reload/reload.js"></script>'
        $('body').append(scriptNode)
        res.send($.html())
      } else {
        res.send(content)
      }
    }
  }

  beginReload() {
    const {app, server} = this
    const self = this
    reload(app).then(function (reloadReturned) {
      server.listen(app.get('port'), function () {
        self.reloadReturned = reloadReturned
        console.log('Midwife web server listening on port ' + app.get('port'))
      })
    }).catch(function (error) {
      console.error('Could not start Midwife server', error)
    })
  }

  reload() {
    if (this.reloadReturned) {
      this.reloadReturned.reload()
    }
  }
}

module.exports = {
  Server,
}

