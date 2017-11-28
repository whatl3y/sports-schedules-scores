import moment from 'moment'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Events from '../libs/Events'
import Leagues from '../libs/Leagues'
import Teams from '../libs/Teams'
import config from '../config'
const log = bunyan.createLogger(config.logger.options)

const postgres = new PostgresClient()
const events = Events(postgres)
const leagues = Leagues(postgres)
const teams = Teams(postgres)

export default async function ApiEventsByDate(req, res) {
  try {
    const leagueName    = req.params.league
    const dateOfEvents  = req.params.date
    const league        = await leagues.findByColumn(leagueName, 'uri_name')

    if (!league)
      return res.status(404).json({error: `Cannot find the league requested: ${leagueName}`})

    const allEvents = await events.getAllByLeagueId(league.id, dateOfEvents)

    res.json({ events: allEvents })

  } catch(err) {
    log.error(err)
    res.status(500).send('Error getting events.')
  }
}
