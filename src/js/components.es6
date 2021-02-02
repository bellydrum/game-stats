import {getTimeSinceStoredDate} from './utils/DateTimeUtil.es6'

export function renderHeaderCard(currentGameData) {

  const currentGame = currentGameData.current_game
  const lastGame = currentGameData.previous_game

  const currentGameLabelText = 'Now playing'
  const notActiveLabelText = 'Currently inactive.'
  const lastGameLabelText = 'Last played'
  const currentGameSectionId = 'currently-playing-info'
  const lastPlayedGameSectionId = 'last-played-info'
  const slightlyBolder = ''
  const slightlySmaller = 'is-size-7'
  const slightlyLarger = 'is-size-6'
  const currentlyPlayingColor = '#00c206'
  const inactiveColor = '#cc0000'

  const currentlyPlaying = document.getElementById(currentGameSectionId)
  const lastPlayed = document.getElementById(lastPlayedGameSectionId)

  /** reset page state upon each refresh **/
  currentlyPlaying.innerHTML = ''
  lastPlayed.innerHTML = ''

  if(currentGame.name.length) {
    /** a game is currently being played **/

    const currentGameLabel = document.createElement('div')
    currentGameLabel.className = `${slightlyBolder} ${slightlySmaller}`
    currentGameLabel.appendChild(document.createTextNode(currentGameLabelText))
    currentlyPlaying.append(currentGameLabel)

    const currentGameTitle = document.createElement('div')
    currentGameTitle.className = slightlyLarger
    currentGameTitle.appendChild(document.createTextNode(`${currentGame.name} (${currentGame.system.toUpperCase()})`))
    currentGameTitle.style.fontStyle = 'italic'
    currentGameTitle.style.color = currentlyPlayingColor
    currentlyPlaying.append(currentGameTitle)

    // uncomment the next line to test game cover images
    // document.getElementById('current-game-image').classList.remove('is-hidden')
    document.getElementById('last-updated-time').innerText = `As of ${getTimeSinceStoredDate(currentGame.time_started)}`
  } else {
    /** no game is being played **/

    const currentGameLabel = document.createElement('div')
    currentGameLabel.className = `${slightlyBolder} ${slightlySmaller}`
    currentGameLabel.appendChild(document.createTextNode(notActiveLabelText))
    currentlyPlaying.append(currentGameLabel)

    // append div with empty string to maintain structure... refactor later
    const currentGameTitle = document.createElement('div')
    currentGameTitle.className = slightlyLarger
    currentGameTitle.appendChild(document.createTextNode('Check back later!'))
    currentGameTitle.style.color = inactiveColor
    currentlyPlaying.append(currentGameTitle)

    document.getElementById('current-game-image').classList.add('is-hidden')
    document.getElementById('last-updated-time').innerText = `As of ${getTimeSinceStoredDate(lastGame.time_ended)}`
  }

  const lastGameLabel = document.createElement('div')
  lastGameLabel.className = `${slightlyBolder} ${slightlySmaller}`
  lastGameLabel.append(document.createTextNode(lastGameLabelText))
  lastPlayed.append(lastGameLabel)

  const lastGameTitle = document.createElement('div')
  lastGameTitle.className = slightlyLarger
  lastGameTitle.appendChild(document.createTextNode(`${lastGame.name} (${lastGame.system.toUpperCase()})`))
  lastGameTitle.style.fontStyle = 'italic'
  lastPlayed.append(lastGameTitle)
}

export function renderScreenshotScroller(screenshotFilenames, url="http://buttcentral.net/images/screenshots/gba/") {
  const sortedScreenshotFilenames = screenshotFilenames.sort((a, b) => {
    const x = a.substr(-17)
    const y = b.substr(-17)
    return x === y ? 0 : x < y ? -1 : 1
  }).reverse().slice(0, 10).map(filename => {
    return url + filename.replace(/\s/g, '%20')
  })
  // Array.from(document.getElementsByClassName('carousel__snapper')).forEach((element, i) => {
  //   const image = document.createElement('img')
  //   image.setAttribute('src', sortedScreenshotFilenames[i])
  //   image.classList.add('screenshot-scroller-img')
  //   element.appendChild(image)
  // })
  const carouselViewport = document.getElementById('carousel-image-container')
  sortedScreenshotFilenames.forEach((filename, i) => {
    const index = i + 1

    const li = document.createElement('li')
    li.setAttribute('id', `carousel__slide${index}`)
    li.setAttribute('tabindex', '0')
    li.classList.add('carousel__slide')

    const div = document.createElement('div')
    div.classList.add('carousel__snapper')

    const image = document.createElement('img')
    image.setAttribute('src', sortedScreenshotFilenames[i])
    image.classList.add('screenshot-scroller-img')

    const a1 = document.createElement('a')
    a1.setAttribute('href', `#carousel_slide${index - 1}`)
    a1.classList.add('carousel_prev')
    const a2 = document.createElement('a')
    a1.setAttribute('href', `#carousel_slide${index + 1}`)
    a1.classList.add('carousel_prev')

    div.appendChild(image)
    div.appendChild(a1)
    div.appendChild(a2)
    li.appendChild(div)

    carouselViewport.appendChild(li)
  })
  // carouselViewport.appendChild
}

// <li id="carousel__slide1" tabindex="0" class="carousel__slide">
//     <div class="carousel__snapper">
//         <a href="#carousel__slide4" class="carousel__prev">Go to last slide</a>
//         <a href="#carousel__slide2" class="carousel__next">Go to next slide</a>
//     </div>
// </li>