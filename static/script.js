async function ls() {
  try {
    const route = hash()
    const files = await api(route)
    filesDiv().innerHTML = '' // clear existing
    files.forEach(f => {
      const fileDiv = document.createElement('div')
      const textNode = document.createTextNode(f)
      if (f.endsWith('/')) {
        const a = document.createElement('a')
        a.setAttribute('href', '#'+route+f)
        a.appendChild(textNode)
        fileDiv.appendChild(a)
      } else {
        fileDiv.appendChild(textNode)
      }
      filesDiv().appendChild(fileDiv)
    })
  } catch (err) {
    handleErr(err)
  }
}

async function api(route) {
  const resp = await fetch('/files'+route)
  const json = await resp.json()
  if (json.error) throw Error(json.error)
  return json
}

function handleErr(err) {
  const errDiv = document.getElementById('error')
  errDiv.innerHTML = '' // clear any existing message
  const text = document.createTextNode(err.message)
  const x = document.createElement('button')
  x.innerText = 'X'
  x.onclick = () => { errDiv.style.display = 'none' }
  errDiv.appendChild(text)
  errDiv.appendChild(x)
  errDiv.style.display = 'block' // show it
}

function filesDiv() {
  return document.getElementById('files')
}

function hash() {
  return window.location.hash.replace('#','')
}

window.onhashchange = async () => {
  // make sure the route always begins and ends with /
  if (hash()) {
    let newHash = hash()
    if (!newHash.startsWith('/')) newHash = '/'+newHash
    if (!newHash.endsWith('/')) newHash += '/'
    if (hash() !== newHash) return window.location.hash = newHash
  }
  await ls()
}

(async function() {
  if (hash()) await ls()
  else window.location.hash = '/'
})();
