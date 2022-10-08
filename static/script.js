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
    document.querySelector('#cwd').innerText = route
  } catch (err) {
    showMessage(err)
  }
}

async function api(route) {
  const resp = await fetch('/files'+route)
  const json = await resp.json()
  if (json.error) throw Error(json.error)
  return json
}

function showMessage(what) {
  const msgDiv = document.querySelector('.message')
  const textDiv = msgDiv.querySelector('.text')
  if (what instanceof Error) {
    textDiv.innerText = what.message
    msgDiv.classList.add('error')
  } else {
    textDiv.innerText = what
    msgDiv.classList.remove('error')
  }
  msgDiv.classList.remove('hidden')
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
    // queue first so we can update the playlist info
    // properly in playAudio()
    queueFollowing(event.target)
    playAudio(path)
  }
}

function isAudioFile(path) {
  if (!path) return false
  const ext = path.split('.').pop()
  const musicExts = [
    'mp3', 'ogg', 'opus', 'm4a'
  ]
  return musicExts.includes(ext)
}

function playAudio(path) {
  const musicDiv = document.querySelector('#music')
  const controlsDiv = musicDiv.querySelector('.controls')
  const info = musicDiv.querySelector('.info')
  info.innerText = path.split('/').pop()
  if (playlist.length) {
    info.innerText += ` (q:${playlist.length})`
  }
  const prevAudio = controlsDiv.querySelector('audio')
  const audio = prevAudio || document.createElement('audio')
  audio.setAttribute('controls', '')
  audio.setAttribute('src', '/files'+path)
  audio.onended = nextSong
  const next = controlsDiv.querySelector('.next')
  next.onclick = nextSong
  const x = controlsDiv.querySelector('.x')
  x.onclick = () => {
    // We want to tear down the audio element when X is
    // pressed to end the media session (notification):
    // https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
    audio.remove()
    musicDiv.style.display='none'
  }
  if (prevAudio) audio.load()
  else controlsDiv.prepend(audio)
  musicDiv.style.display = 'block' // show it
  audio.play()
}

function queueFollowing(element) {
  playlist.length = 0 // clear it first
  let next = element
  // eslint-disable-next-line no-cond-assign
  while (next=next.nextElementSibling) {
    var path = next.getAttribute('data-path')
    if (isAudioFile(path)) {
      playlist.push(path)
    }
  }
}

function nextSong() {
  if (playlist.length) {
    playAudio(playlist.shift())
  }
}

async function quit() {
  try {
    const resp = await fetch('/quit')
    if (!resp.ok) {
      return showMessage(Error(resp.statusText))
    }
    document.querySelector('#top').remove()
    document.querySelector('#music').remove()
    document.querySelector('#files').remove()
    window.onhashchange = null
    showMessage('Bye!')
  } catch (err) {
    showMessage(err)
  }
}

document.querySelector('.message .x').onclick = () => {
  document.querySelector('.message').classList.add('hidden')
}
document.querySelector('#toggle-options').onclick = () => {
  document.querySelector('#options').classList.toggle('hidden')
}
document.querySelector('#quit').onclick = async () => {
  await quit()
}

(async function() {
  if (hash()) await ls()
  else window.location.hash = '/'
})();
