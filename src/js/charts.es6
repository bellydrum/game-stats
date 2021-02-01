import {hourMinuteFormat, getHourMinSecFromSeconds} from './utils/DateTimeUtil.es6'
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
      name: 'Time played',
      data: tenMostPlayedGames.map(a => a.play_time_seconds)
    }],
   colors: ['#9babe9'],
    chart: {
      animations: {
        enabled: firstDraw,
        speed: 400
      },
      redrawOnWindowResize: false,
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
        formatter: (a) => {return `${Number((a / 60) / 60).toFixed(1)} hours`}, // format the result of series data
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
    tooltip: {
        theme: 'dark',
        followCursor: true,
        y: {
            formatter: (value, {seriesIndex, dataPointIndex, w}) => {
                const hoursMinutesSeconds = getHourMinSecFromSeconds(value)
                console.log(hoursMinutesSeconds)
                return `${hoursMinutesSeconds[0]}:${hoursMinutesSeconds[1]}:${hoursMinutesSeconds[2]}`
            }
        },
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        xaxis: {
          categories: tenMostPlayedGames.map(a => `${a.name} (${a.system.toUpperCase()})`),
          labels: {
            formatter: (a) => {return `${parseInt(a / 60)}`},
            style: {
              colors: [ '#bbb', ],
            }
          }
        },
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

  // let options = {
  //   series: tenMostPlayedGames.slice(0, 5).map(a => a.play_time_seconds),
  //   labels: tenMostPlayedGames.slice(0, 5).map(a => `${a.name} (${a.system.toUpperCase()})`),
  //   chart: {
  //     type: 'donut',
  //     animations: {
  //       enabled: firstDraw,
  //       speed: 400
  //     },
  //   },
  //   legend: {
  //     show: true,
  //     position: 'right',
  //     floating: true,
  //     labels: {
  //       colors: '#bbb'
  //     }
  //   },
  //   dataLabels: {
  //     enabled: false
  //   },
  //   plotOptions: {
  //     pie: {
  //       expandOnClick: false,
  //       customScale: 0.5,
  //       donut: {
  //         size: '80%',
  //       }
  //     }
  //   },
  //   responsive: [{
  //     breakpoint: 480,
  //     options: {
  //       chart: {
  //         width: 200
  //       },
  //       legend: {
  //         position: 'bottom',
  //         floating: true
  //       },
  //       plotOptions: {
  //         pie: {
  //           customScale: 0.9,
  //           donut: {
  //             size: '70%',
  //           }
  //         }
  //       }
  //     }
  //   }]
  // };

  let options = {
      series: tenMostPlayedGames.slice(0, 5).map(a => a.play_time_seconds),
      labels: tenMostPlayedGames.slice(0, 5).map(a => `${a.name} (${a.system.toUpperCase()})`),
    chart: {
      type: 'donut',
      animations: {
        enabled: firstDraw,
        speed: 400
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        customScale: 0.8,
        expandOnClick: false,
      }
    },
    legend: {
        labels: {
          colors: '#bbb'
        }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
        },
        legend: {
          position: 'bottom'
        },
        plotOptions: {
          pie: {
            customScale: 1,
            expandOnClick: false,
          }
        },
      }
    }]
  }

  let chart = new ApexCharts(document.querySelector("#gamePlaytimeDivision"), options);
  chart.render();

}
