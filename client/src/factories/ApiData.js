export default {
  async getAll(league) {
    const response = await fetch(`/api/events/${league}`)
    return response.json()
  }
}
