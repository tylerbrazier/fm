const http = require('node:http')
const fs = require('node:fs')
const os = require('node:os')

const port = 8080
const root = os.homedir()
const filesPrefix = '/files'
const staticDir = __dirname+'/static'

const server = http.createServer()
server.on('request', onRequest)
server.listen(port, () => console.log('Listening on '+port))

function onRequest(req, res) {
  try {
    // base doesn't matter here; we just need to parse the path
    var url = new URL(req.url, 'http://localhost')
  } catch (err) {
    return handleErr(err, res)
  }
  if (!url.pathname || url.pathname === '/') {
    sendStatic('/index.html', res)
  } else if (url.pathname.startsWith(filesPrefix)) {
    const path = root+url.pathname.slice(filesPrefix.length)
    ls(path, res)
  } else {
    sendStatic(url.pathname, res)
  }
}

function sendStatic(filepath, res) {
  fs.readFile(staticDir+filepath, (err,data) => {
    if (err) return handleErr(err, res)
    if (filepath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html')
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css')
    } else if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript')
    }
    res.end(data)
  })
}

function ls(path, res) {
  const opts = {withFileTypes:true}
  fs.readdir(path, opts, (err, dirents) => {
    if (err) return handleErr(err, res)
    const files = dirents.map(d => {
      if (d.isDirectory()) return d.name+'/'
      else return d.name
    })
    sendJson(files, res)
  })
}

function handleErr(err, res) {
  console.error(err)
  if (err.code === 'ENOENT') res.statusCode = 404
  else if (res.statusCode === 200) res.statusCode = 500
  sendJson({error:err.message}, res)
}

function sendJson(obj, res) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(obj))
}
