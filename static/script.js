const playlist = []

async function ls() {
  try {
    const route = hash()
    const fileNames = await api(route)
    const filesDiv = document.querySelector('#files')
    filesDiv.innerHTML = '' // clear existing
    fileNames.forEach(f => {
      const fileDiv = document.createElement('div')
      const textNode = document.createTextNode(f)
      const path = route+f
      fileDiv.classList.add('file')
      if (f.endsWith('/')) {
        // it's a dir
        const a = document.createElement('a')
        a.setAttribute('href', '#'+path)
        a.appendChild(textNode)
        fileDiv.appendChild(a)
      } else {
        // it's a regular file
        fileDiv.appendChild(textNode)
        fileDiv.setAttribute('data-path', path)
        fileDiv.onclick = fileClicked
        if (isAudioFile(path)) {
          fileDiv.classList.add('song')
        }
      }
      filesDiv.appendChild(fileDiv)
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
  const errDiv = document.querySelector('#error')
  errDiv.innerHTML = '' // clear any existing message
  const x = document.createElement('button')
  x.classList.add('x')
  x.innerText = 'X'
  x.onclick = () => {
    errDiv.style.display = 'none'
    errDiv.innerHTML = ''
  }
  const text = document.createTextNode(err.message)
  errDiv.appendChild(text)
  errDiv.appendChild(x)
  errDiv.style.display = 'block' // show it
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

function fileClicked(event) {
  const path = event.target.getAttribute('data-path')
  if (isAudioFile(path)) {
    playAudio(path)
    queueFollowing(event.target)
  }
}

function isAudioFile(path) {
  const ext = path.split('.').pop()
  const musicExts = [
    'mp3', 'ogg', 'opus', 'm4a'
  ]
  return musicExts.includes(ext)
}

function playAudio(path) {
  // We want to tear down the audio element when X is
  // pressed to end the media session (notification):
  // https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
  // Rather than defining some elements in the html file
  // that will stick around and make some dynamic ones,
  // we'll just rebuild everything when a new song is played;
  // plus then there's not all these elements hiding in the DOM.
  const musicDiv = document.querySelector('#music')
  musicDiv.innerHTML = '' // remove existing
  const titleDiv = document.createElement('div')
  titleDiv.classList.add('title')
  titleDiv.innerText = path.split('/').pop()
  const audio = document.createElement('audio')
  audio.setAttribute('controls', '')
  audio.setAttribute('src', '/files'+path)
  audio.onended = onAudioEnded
  const x = document.createElement('button')
  x.classList.add('x')
  x.innerText = 'X'
  x.onclick = () => {
    musicDiv.style.display='none'
    musicDiv.innerHTML = ''
  }
  musicDiv.appendChild(titleDiv)
  musicDiv.appendChild(audio)
  musicDiv.appendChild(x)
  musicDiv.style.display = 'block' // show it
  audio.play()
}

function queueFollowing(element) {
  playlist.length = 0 // clear it first
  let next = element
  while (next=next.nextElementSibling) {
    var path = next.getAttribute('data-path')
    if (isAudioFile(path)) {
      playlist.push(path)
    }
  }
}

function onAudioEnded(event) {
  if (playlist.length) {
    playAudio(playlist.shift())
  }
}

(async function() {
  if (hash()) await ls()
  else window.location.hash = '/'
})();
