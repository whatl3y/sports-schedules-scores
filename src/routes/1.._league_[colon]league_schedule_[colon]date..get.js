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

export default async function LeagueSchedule(req, res) {
  const leagueName = req.params.league
  const activeDate = req.params.date
  const league = await leagues.findByColumn(leagueName, 'uri_name')

  const [allLeagues, allEvents, allTeams, allConferences] = await Promise.all([
    leagues.getAll(),
    events.getAllByLeagueId(league.id, activeDate),
    teams.getAll(league.id),
    teams.getAllConferences(league.id),
  ])
  res.render('dailySchedule', {
    data: {
      awsS3BaseUrl: `http://${config.aws.s3.bucket}.s3-website.us-east-1.amazonaws.com`,
      leagues: allLeagues,
      activeLeague: league,

      events: allEvents,
      allTeams,
      allConferences,

      ...Helpers,
    },
  })
}
