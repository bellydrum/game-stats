import {hourMinuteFormat} from './utils/DateTimeUtil.es6'
import {ANIMATIONS, COLORS, DATA_LABELS_COLORS} from './constants.es6'

export function renderCharts(games, firstDraw=false) {
  const gameTitlesSortedByTimePlayed = Object.entries(games)
    .map(game => { return [ game[1].name, game[1].play_time_seconds ] })
    .sort((a, b) => { return b[1] - a[1] })

  const tenMostPlayedGames = gameTitlesSortedByTimePlayed.slice(0, 10)
    .map(name => { return games[name[0]] })

  renderGamesWithMostPlaytime(tenMostPlayedGames, firstDraw)
}

function renderGamesWithMostPlaytime(tenMostPlayedGames, firstDraw=false) {

  // reset graph container
  document.querySelector("#gamesWithMostPlaytime").innerHTML = ''

  let options = {
    series: [{
      data: tenMostPlayedGames.map(a => a.play_time_seconds)
    }],
    chart: {
      animations: {
        enabled: firstDraw,
        speed: 400
      },
      toolbar: {
        show: false,
      },
      type: 'bar',
      height: 350
    },
    grid: {
      show: false,
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: 'left',
          textAnchor: 'start',
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#333']
        },
        offsetX: 0
      },
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: tenMostPlayedGames.map(a => `${a.name} (${a.system.toUpperCase()})`),
      labels: {
        formatter: (a) => {return `${parseInt(a / 60)} min`}
      }
    },
    yaxis: {
      labels: {
        maxWidth: 300,
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        // chart: {
        //   width: '70%',
        // },
        yaxis: {
          labels: {
            maxWidth: 160,
          }
        },
      }
    }]
  };

  let chart = new ApexCharts(document.querySelector("#gamesWithMostPlaytime"), options);
  chart.render();
}