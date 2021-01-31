export function renderHeader(currentGameData) {

  const currentGame = currentGameData.current_game
  const lastGame = currentGameData.previous_game

  const currentGameLabelText = 'Currently playing:'
  const notActiveLabelText = 'The pi is currently off.'
  const lastGameLabelText = 'Previous game'
  const currentGameSectionId = 'currently-playing-info'
  const lastPlayedGameSectionId = 'last-played-info'
  const infoLabelSize = 'is-size-5'

  const currentlyPlaying = document.getElementById(currentGameSectionId)
  const lastPlayed = document.getElementById(lastPlayedGameSectionId)

  if(Object.keys(currentGame).length !== 0) {

    const currentGameLabel = document.createElement('div')
    currentGameLabel.appendChild(document.createTextNode(currentGameLabelText))
    currentlyPlaying.append(currentGameLabel)

    const currentGameTitle = document.createElement('div')
    currentGameTitle.className = infoLabelSize
    currentGameTitle.appendChild(document.createTextNode(currentGame.name))
    currentGameTitle.style.fontStyle = 'italic'
    currentlyPlaying.append(currentGameTitle)

  } else {

    const currentGameLabel = document.createElement('div')
    currentGameLabel.appendChild(document.createTextNode(notActiveLabelText))
    currentlyPlaying.append(currentGameLabel)
  }

  const lastGameLabel = document.createElement('div')
  lastGameLabel.append(document.createTextNode(lastGameLabelText))
  lastPlayed.append(lastGameLabel)

  const lastGameTitle = document.createElement('div')
  lastGameTitle.className = infoLabelSize
  lastGameTitle.appendChild(document.createTextNode(`${lastGame.name} (${lastGame.system.toUpperCase()})`))
  lastGameTitle.style.fontStyle = 'italic'
  lastPlayed.append(lastGameTitle)

}