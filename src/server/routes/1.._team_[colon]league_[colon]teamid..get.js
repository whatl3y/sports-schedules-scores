// import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Events from '../libs/models/Events'
import Leagues from '../libs/models/Leagues'
import Teams from '../libs/models/Teams'
import * as Helpers from '../libs/Helpers'
import config from '../config'
// const log = bunyan.createLogger(config.logger.options)

const postgres = new PostgresClient()
const events = Events(postgres)
const leagues = Leagues(postgres)
const teams = Teams(postgres)

export default async function Team(req, res) {
  const leagueName = req.params.league
  const teamId = parseInt(req.params.teamid)
  const league = await leagues.findByColumn(leagueName, 'uri_name')
  const team = await teams.findBy({ league_id: league.id, api_uid: teamId })

  const [allLeagues, allEvents] = await Promise.all([
    leagues.getAllOrdered(),
    events.getAllByTeamId(team.id),
  ])
  res.render('team', {
    data: {
      awsS3BaseUrl: `http://${config.aws.s3.bucket}.s3-website.us-east-1.amazonaws.com`,
      leagues: allLeagues,
      activeLeague: league,
      activeTeam: team,

      events: allEvents,

      ...Helpers,
    },
  })
}
