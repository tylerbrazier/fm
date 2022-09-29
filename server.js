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
    sendFile(staticDir+'/index.html', res)
  } else if (url.pathname.startsWith(filesPrefix)) {
    const path = root+url.pathname.slice(filesPrefix.length)
    if (path.endsWith('/')) ls(path, res)
    else sendFile(path, res)
  } else {
    sendFile(staticDir+url.pathname, res)
  }
}

function sendFile(filepath, res) {
  fs.readFile(filepath, (err,data) => {
    if (err) return handleErr(err, res)
    const type = getContentType(filepath)
    if (type) res.setHeader('Content-Type', type)
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
  const json = JSON.stringify(obj)
  // console.debug(json)
  res.end(json)
}

// returns null if you shouldn't set Content-Type
// https://httpwg.org/specs/rfc9110.html#field.content-type
function getContentType(filename) {
  const ext = filename.split('.').pop()
  switch (ext) {
    case 'txt':
      return 'text/plain'
    case 'html':
      return 'text/html'
    case 'css':
      return 'text/css'
    case 'js':
      return 'application/javascript'
    case 'json':
      return 'application/json'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'mp3':
      return 'audio/mpeg'
    case 'ogg':
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Configuring_servers_for_Ogg_media
      return 'application/ogg'
    case 'opus':
      return 'audio/opus'
    case 'm4a':
      // https://stackoverflow.com/q/39885749
      return 'audio/mp4'
    default:
      return null
  }
}
