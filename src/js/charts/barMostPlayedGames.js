export default options = {
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
}