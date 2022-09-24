(async function() {
  const filesDiv = document.createElement('div')
  await ls('/files', filesDiv)
  // alert(document.body.innerHTML); // for debugging on android
})();

async function ls(route, filesDiv) {
  try {
    const files = await api(route)
    files.forEach(f => {
      const fileDiv = document.createElement('div')
      const textNode = document.createTextNode(f)
      fileDiv.appendChild(textNode)
      filesDiv.appendChild(fileDiv)
    })
    document.body.appendChild(filesDiv)
  } catch (err) {
    handleErr(err)
  }
}

async function api(route) {
  const resp = await fetch(route)
  const json = await resp.json()
  if (json.error) throw Error(json.error)
  return json
}

function handleErr(err) {
  alert(err)
}
