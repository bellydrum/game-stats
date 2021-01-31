export function renderHeaderCard(currentGameData) {

  const currentGame = currentGameData.current_game
  const lastGame = currentGameData.previous_game

  const currentGameLabelText = 'Currently playing:'
  const notActiveLabelText = 'The pi is currently off.'
  const lastGameLabelText = 'Previous game'
  const currentGameSectionId = 'currently-playing-info'
  const lastPlayedGameSectionId = 'last-played-info'
  const slightlyBolder = ''
  const slightlySmaller = 'is-size-7'
  const slightlyLarger = 'is-size-6'

  const currentlyPlaying = document.getElementById(currentGameSectionId)
  const lastPlayed = document.getElementById(lastPlayedGameSectionId)

  if(Object.keys(currentGame).length !== 0) {

    const currentGameLabel = document.createElement('div')
    currentGameLabel.className = `${slightlyBolder} ${slightlySmaller}`
    currentGameLabel.appendChild(document.createTextNode(currentGameLabelText))
    currentlyPlaying.append(currentGameLabel)

    const currentGameTitle = document.createElement('div')
    currentGameTitle.className = slightlyLarger
    currentGameTitle.appendChild(document.createTextNode(`${currentGame.name} (${currentGame.system.toUpperCase()})`))
    currentGameTitle.style.fontStyle = 'italic'
    currentlyPlaying.append(currentGameTitle)

  } else {

    const currentGameLabel = document.createElement('div')
    currentGameLabel.className = `${slightlyBolder} ${slightlySmaller}`
    currentGameLabel.appendChild(document.createTextNode(notActiveLabelText))
    currentlyPlaying.append(currentGameLabel)
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