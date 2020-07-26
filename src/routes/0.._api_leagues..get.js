import moment from 'moment'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Leagues from '../libs/models/Leagues'
import config from '../config'
const log = bunyan.createLogger(config.logger.options)

const postgres = new PostgresClient()
const leagues = Leagues(postgres)

export default async function ApiLeagues(req, res) {
  try {
    const allLeagues = await leagues.getAll()
    res.json({ leagues: allLeagues })
  } catch (err) {
    log.error(err)
    res.status(500).send('Error getting events.')
  }
}
