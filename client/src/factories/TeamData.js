export default {
  async get(uid, leagueName) {
    const response = await fetch(`/api/teams/${leagueName}/${uid}`)
    return response.json()
  }
}
