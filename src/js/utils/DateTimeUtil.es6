export function hourMinuteFormat(minutes) {
  /**
   * @param minutes <number>
   * @return 1 hr, 39 min
   * @type {string}
   */
  const formatted = new Date((minutes * 60) * 1000).toISOString()
  return `${
    parseInt(formatted.substr(11, 2))} hr, ${
    parseInt(formatted.substr(14, 2))} min`
}