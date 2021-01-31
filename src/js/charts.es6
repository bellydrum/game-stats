import {hourMinuteFormat} from './utils/DateTimeUtil.es6'
import {ANIMATIONS, COLORS, DATA_LABELS_COLORS} from './constants.es6'

export function renderCharts(games, firstDraw=false) {
  const gameTitlesSortedByTimePlayed = Object.entries(games)
    .map(game => { return [ game[1].name, game[1].play_time_seconds ] })
    .sort((a, b) => { return b[1] - a[1] })

  const tenMostPlayedGames = gameTitlesSortedByTimePlayed.slice(0, 10)
    .map(name => { return games[name[0]] })

  renderGamesWithMostPlaytime(tenMostPlayedGames, firstDraw)
  renderGamePlaytimeDivision(tenMostPlayedGames, firstDraw)
}

function renderGamesWithMostPlaytime(tenMostPlayedGames, firstDraw=false) {

  // reset graph container
  document.querySelector("#gamesWithMostPlaytime").innerHTML = ''

  let options = {
    series: [{
      data: tenMostPlayedGames.map(a => a.play_time_seconds)
    }],
    colors: ['#9babe9'],
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
    },
    xaxis: {
      categories: tenMostPlayedGames.map(a => `${a.name} (${a.system.toUpperCase()})`),
      labels: {
        formatter: (a) => {return `${parseInt(a / 60)} min`},
        style: {
          colors: [ '#bbb', ],
        }
      }
    },
    yaxis: {
      labels: {
        maxWidth: 300,
        style: {
          colors: '#bbb',
        }
      }
    },
    dataLabels: {
      enabled: false,
      offsetX: 20,
      style: {
        colors: ['#333']
      },
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
            style: {
              colors: '#bbb',
            }
          },
        },
      }
    }]
  };

  let chart = new ApexCharts(document.querySelector("#gamesWithMostPlaytime"), options);
  chart.render();
}


function renderGamePlaytimeDivision(tenMostPlayedGames, firstDraw=false) {

  document.querySelector("#gamePlaytimeDivision").innerHTML = ''

  let options = {
    series: [44, 55, 41, 17, 15],
    chart: {
      type: 'donut',
      animations: {
        enabled: firstDraw,
        speed: 400
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  let chart = new ApexCharts(document.querySelector("#gamePlaytimeDivision"), options);
  // chart.render();

}