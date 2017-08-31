import moment from 'moment'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Events from '../libs/Events'
import Teams from '../libs/Teams'
import config from '../config'
const log = bunyan.createLogger(config.logger.options)

const postgres = new PostgresClient()
const events = Events(postgres)
const teams = Teams(postgres)

export default async function ApiEvents(req, res) {
  try {
    const latestDate = null// moment().add(30, 'days').format('YYYY-MM-DD')
    const [ allEvents, allTeams ] = await Promise.all([
      events.getAll(latestDate),
      teams.getAll()
    ])

    res.json({events: allEvents, teams: allTeams})

  } catch(err) {
    log.error(err)
    res.status(500).send('Error getting events.')
  }
}
