import PostgresClient from '../libs/PostgresClient'
import Events from '../libs/Events'
import Teams from '../libs/Teams'

const postgres = new PostgresClient()
const events = Events(postgres)
const teams = Teams(postgres)

export default async function ApiEvents(req, res) {
  const [ allEvents, allTeams ] = await Promise.all([
    events.getAll(),
    teams.getAll()
  ])

  res.json({events: allEvents, teams: allTeams})
}
