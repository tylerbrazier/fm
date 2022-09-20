const http = require('node:http')
const fs = require('node:fs')
const os = require('node:os')

const port = 8080
const root = os.homedir()

const server = http.createServer()
server.on('request', onRequest)
server.listen(port, () => console.log('Listening on '+port))

function onRequest(req, res) {
  fs.readdir(root, {withFileTypes:true}, (err, dirents) => {
    res.setHeader('Content-Type', 'text/html')
    if (err) {
      console.error(err)
      res.statusCode = 500
      res.end(htmlTemplate(`<p>${err.message}</p>`))
      return
    }
    res.end(renderDir(dirents))
  })
}

function renderDir(dirents) {
  return htmlTemplate(dirents.reduce(reducer, ''))

  function reducer(prev, dirent) {
    return `${prev}<p>${dirent.name}</p>\n`
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
