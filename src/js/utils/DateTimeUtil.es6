export function hourMinuteFormat(minutes) {
  /**
   * @param minutes <number>
   * @return 1 hr, 39 min
   */
  const formatted = new Date((minutes * 60) * 1000).toISOString()
  return `${
    parseInt(formatted.substr(11, 2))} hr, ${
    parseInt(formatted.substr(14, 2))} min`
}

export function convertStoredDateString(date, makeReadable=true) {
  /**
   * @param date            <string/Date>   date to be formatted
   * @param makeReadable    <string>        true: convert from ISO to readable; when false, vice versa.
   * @return <string>
   */
  console.log(date)
  if(makeReadable) {
    /** from %H:%M:%S %m-%d-%Y to January 31, 2021 at 7:32 PM **/
    const newDate = getDateFromStoredDate(date)
    const monthName = newDate.toLocaleString('en-us', { month: 'long' })
    const readableTime = newDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

    date = `${monthName} ${newDate.getDate()}, ${newDate.getFullYear()} at ${readableTime} CST`

  }
  return date
}

export function getHourMinSecFromSeconds(number) {
    const hours = parseInt((number / 60) / 60)
    const minutes = parseInt(number / 60) % 60
    const seconds = parseInt(number % 60)
    //const seconds = parseInt(Number((number % 1) * 60).toFixed(2))
    //return [
    //    parseInt(number).toString(), // minutes
    //    seconds.toString().length === 2 ? seconds : '0' + seconds.toString() // seconds
    //]
    return [
        hours.toString(),
        minutes.toString().length === 2 ? minutes : `0${minutes.toString()}`,
        seconds.toString().length === 2 ? seconds : `0${seconds.toString()}`
    ]
}

export function getDateFromStoredDate(storedDate) {
  const dateSplitOnSpace = storedDate.split(' ')
  const h = dateSplitOnSpace[0].split(':')
  const m = dateSplitOnSpace[1].split('-')
  return new Date(new Date(`${m[2]}-${m[0]}-${m[1]}T${h[0]}:${h[1]}:${h[2]}`)
    .toLocaleString('en-us', { timeZone: 'CST' }))
}

export function getTimeSinceStoredDate(date) {
  return date ? time_ago(getDateFromStoredDate(date)) : ''
}

function time_ago(time) {

  switch (typeof time) {
    case 'number':
      break;
    case 'string':
      time = +new Date(time);
      break;
    case 'object':
      if (time.constructor === Date) time = time.getTime();
      break;
    default:
      time = +new Date();
  }
  let time_formats = [
    [60, 'seconds', 1], // 60
    [120, '1 minute ago', '1 minute from now'], // 60*2
    [3600, 'minutes', 60], // 60*60, 60
    [7200, '1 hour ago', '1 hour from now'], // 60*60*2
    [86400, 'hours', 3600], // 60*60*24, 60*60
    [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
    [604800, 'days', 86400], // 60*60*24*7, 60*60*24
    [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
    [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
    [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
    [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
    [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
    [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];
  let seconds = (+new Date() - time) / 1000,
    token = 'ago',
    list_choice = 1;

  if (seconds === 0) {
    return 'Just now'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  let i = 0, format;
  while (format = time_formats[i++])
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
}
