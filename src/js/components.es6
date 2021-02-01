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

  if(Object.keys(currentGame).length !== 0) {
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