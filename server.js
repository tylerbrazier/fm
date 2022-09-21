const http = require('node:http')
const fs = require('node:fs')
const os = require('node:os')

const port = 8080
const root = os.homedir()

const server = http.createServer()
server.on('request', onRequest)
server.listen(port, () => console.log('Listening on '+port))

function onRequest(req, res) {
  let url, path;
  try {
    // base doesn't matter here; we just need to parse the path
    url = new URL(req.url, 'http://localhost')
    path = root + url.pathname
  } catch (err) {
    return handleErr(err, res)
  }
  const opts = {withFileTypes:true}
  fs.readdir(path, opts, (err, dirents) => {
    if (err) {
      if (err.code === 'ENOENT') res.statusCode = 404
      return handleErr(err, res)
    }
    res.setHeader('Content-Type', 'text/html')
    res.end(renderDir(dirents, url.pathname))
  })
}

function renderDir(dirents, urlPath) {
  return htmlTemplate(dirents.reduce(reducer, ''))

  function reducer(prev, dirent) {
    let result = prev + '<p>'
    if (dirent.isDirectory()) {
      // make it a link
      result+=`<a href="${urlPath}/${dirent.name}">`
    }
    result+=dirent.name
    if (dirent.isDirectory()) result+='</a>'
    result+='</p>\n'
    return result
  }
}

function htmlTemplate(content) {
  // https://validator.w3.org/
  return `\
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <!--
    https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag
    https://developers.google.com/web/fundamentals/design-and-ux/responsive/
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>fm</title>
  </head>
  <body>
${content}
  </body>
</html>`
}

function handleErr(err, res) {
  console.error(err)
  if (res.statusCode === 200) res.statusCode = 500
  res.setHeader('Content-Type', 'text/html')
  res.end(htmlTemplate(`<p>${err.message}</p>`))
}
