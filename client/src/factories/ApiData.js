export default {
  async getLeagues() {
    const response = await fetch(`/api/leagues`)
    return response.json()
  },

  async getAll(league) {
    const response = await fetch(`/api/events/${league}`)
    return response.json()
  },

  async getAllByDate(league, date) {
    const response = await fetch(`/api/events/${league}/${date}`)
    return response.json()
  }
}
