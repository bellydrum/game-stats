const BASE_URL = 'http://buttcentral.com'

const getLatestGameplayStats = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/games`)

    const data = res.data;

    console.log(`GET: Here's the game data: ${JSON.stringify(data)}`)

    return data
  } catch (e) {
    console.error(e)
  }
}

const response = getLatestGameplayStats()

console.log(response)