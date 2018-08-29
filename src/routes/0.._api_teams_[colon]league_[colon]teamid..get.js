import moment from 'moment'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Events from '../libs/models/Events'
import Leagues from '../libs/models/Leagues'
import Teams from '../libs/models/Teams'
import config from '../config'
const log = bunyan.createLogger(config.logger.options)

const postgres  = new PostgresClient()
const events    = Events(postgres)
const leagues   = Leagues(postgres)
const teams     = Teams(postgres)

export default async function ApiTeams(req, res) {
  try {
    const leagueName  = req.params.league
    const teamId      = parseInt(req.params.teamid)
    const league      = await leagues.findByColumn(leagueName, 'uri_name')
    const team        = await teams.findBy({ league_id: league.id, api_uid: teamId })

    if (!team)
      return res.status(404).json({error: `Cannot find the team requested: ${teamId}`})

    const allEvents = await events.getAllByTeamId(team.id)
    res.json({ events: allEvents, team: team })

  } catch(err) {
    log.error(err)
    res.status(500).send('Error getting team info.')
  }
}
