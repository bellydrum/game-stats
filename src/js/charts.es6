import {hourMinuteFormat} from './utils/DateTimeUtil.es6'
import {ANIMATIONS, COLORS, DATA_LABELS_COLORS} from './constants.es6'

export function renderCharts(games) {
  const gameTitlesSortedByTimePlayed = Object.entries(games)
    .map(game => { return [ game[1].name, game[1].play_time_seconds ] })
    .sort((a, b) => { return b[1] - a[1] })

  const tenMostPlayedGames = gameTitlesSortedByTimePlayed.slice(0, 10)
    .map(name => { return games[name[0]] })
  //
  // renderMostPlayedGamesBar(tenMostPlayedGames)
  // // renderMostPlayedGamesTreeMap(tenMostPlayedGames)
  // renderPastGameTime(tenMostPlayedGames)
}
