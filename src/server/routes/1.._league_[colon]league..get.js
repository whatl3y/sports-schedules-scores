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

export default async function League(req, res) {
  await getLeagueAndEventData(req, res)
}

export async function getLeagueAndEventData(req, res) {
  const leagueName = req.params.league
  const activeDate = req.params.date
  const searchTerm = req.query.search

  const activeLeague = await leagues.findBy({ uri_name: leagueName })

  const [allLeagues, allEvents, allTeams, allConferences] = await Promise.all([
    leagues.getAll(),
    events.getAllByLeagueId(activeLeague.id, activeDate),
    teams.getAll(activeLeague.id, searchTerm),
    teams.getAllConferences(activeLeague.id),
  ])

  res.render('league', {
    data: {
      awsS3BaseUrl: `http://${config.aws.s3.bucket}.s3-website.us-east-1.amazonaws.com`,
      leagues: allLeagues,
      activeLeague,
      activeDate,

      events: allEvents,
      teams: allTeams,
      conferences: allConferences.map((c) => c.conference_abbreviation),

      ...Helpers,
    },
  })
}
