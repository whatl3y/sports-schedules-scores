export default {
  async getAll() {
    const response = await fetch(`/api/events`)
    return response.json()
  }
}
