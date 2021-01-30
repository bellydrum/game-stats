import {hourMinuteFormat} from './utils/DateTimeUtil.es6'
import {ANIMATIONS, COLORS, DATA_LABELS_COLORS} from './constants.es6'

export function renderCharts(games) {
  const gameTitlesSortedByTimePlayed = Object.entries(games)
    .map(game => { return [ game[1].name, game[1].play_time_seconds ] })
    .sort((a, b) => { return b[1] - a[1] })

  const tenMostPlayedGames = gameTitlesSortedByTimePlayed.slice(0, 10)
    .map(name => { return games[name[0]] })

  renderMostPlayedGamesBar(tenMostPlayedGames)
  // renderMostPlayedGamesTreeMap(tenMostPlayedGames)
  renderPastGameTime(tenMostPlayedGames)
}

export function renderHeader(currentGame) {

}

function renderMostPlayedGamesBar(tenMostPlayedGames) {

  const options = {
    series: [{
      data: tenMostPlayedGames.map(game => game.play_time_seconds / 60)
    }],
    chart: {
      type: 'bar',
      height: 380
    },
    plotOptions: {
      bar: {
        barHeight: '100%',
        distributed: true,
        horizontal: true,
        dataLabels: {
          position: 'bottom'
        },
      }
    },
    colors: COLORS,
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: DATA_LABELS_COLORS
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex]
      },
      offsetX: 0,
      dropShadow: {
        enabled: false
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: tenMostPlayedGames.map(game => `${game.name} (${game.system.toUpperCase()})`),
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    title: {
      text: 'Highest playtime',
      align: 'center',
      floating: true
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        title: {
          formatter: function () {
            return ''
          }
        }
      }
    }
  };


  const ptions = {
    series: [{
      data: tenMostPlayedGames.map(game => game.play_time_seconds / 60)
    }],
    chart: {
      type: 'bar',
      height: 380,
      animations: ANIMATIONS,
    },
    plotOptions: {
      bar: {
        barHeight: '100%',
        distributed: true,
        horizontal: true,
        dataLabels: {
          position: 'bottom'
        },
      }
    },
    colors: COLORS,
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: DATA_LABELS_COLORS
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex]
      },
      offsetX: 0,
      background: {
        enabled: false,
        opacity: 0
      },
      dropShadow: {
        enabled: false
      },
      fontWeight: 300,
    },
    stroke: {
      show: false,
      width: 0.5,
      colors: ['#bbb']
    },
    xaxis: {
      categories: tenMostPlayedGames.map(game => `${game.name} (${game.system.toUpperCase()})`),
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    title: {
      text: 'Top ten most-played games',
      align: 'center',
      floating: true
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true
      },
      y: {
        title: {
          formatter: function () {
            return ''
          }
        }
      }
    }
  };

  new ApexCharts(document.querySelector("#gameplayTimeChart"), options).render()
}


function renderMostPlayedGamesTreeMap(tenMostPlayedGames) {
  const options = {
    chart: {
      height: 350,
      type: "treemap",
    },
    series: [{
      data: Object.entries(tenMostPlayedGames)
        .map(game => { return { x: game[1].name, y: game[1].play_time_seconds } })
    }]
  }

  new ApexCharts(document.querySelector("#gameplayTimeChart"), options).render()

}


function renderPastGameTime(games) {

}