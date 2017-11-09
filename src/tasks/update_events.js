import minimist from 'minimist'
import moment from 'moment'
import Promise from 'bluebird'
import bunyan from 'bunyan'
import { createNestedArrays } from '../libs/Helpers'
import PostgresClient from '../libs/PostgresClient'
import Aws from '../libs/Aws'
import SportsApi from '../libs/SportsApi'
import Events from '../libs/Events'
import Leagues from '../libs/Leagues'
import Teams from '../libs/Teams'
import config from '../config'

const argv = minimist(process.argv.slice(2), { string: [ 'l', 'league', 's', 'start', 'e', 'end' ] })
const log = bunyan.createLogger(config.logger.options)

const postgres  = new PostgresClient()
const events    = Events(postgres)
const leagues   = Leagues(postgres)
const teams     = Teams(postgres)
const aws       = Aws().S3
const api       = SportsApi()

;(async () => {
  try {
    const league    = argv.l || argv.league
    const timeSpan  = argv.t || argv.span
    let startDate   = argv.s || argv.start
    let endDate     = argv.e || argv.end

    if (startDate)
      startDate = moment(startDate)

    if (endDate)
      endDate = moment(endDate)

    if (startDate && timeSpan) {
      switch (timeSpan) {
        case 'month':
          endDate = startDate.clone().add(1, 'month')
          break
        case 'week':
          endDate = startDate.clone().add(1, 'week')
          break
        case 'day':
          endDate = startDate.clone().add(1, 'day')
          break
      }
    }

    if ((startDate && !startDate.isValid()) || (endDate && !endDate.isValid()))
      return log.error("Make sure any dates you enter are in the form of YYYY-MM-DD.")


    let leagueAry = api.leagues
    if (league)
      leagueAry = [ league ]

    await Promise.each(leagueAry, async internalLeague => {
      const [ leagueInfo, ids ] = await Promise.all([
        leagues.findOrCreateByColumn(internalLeague, 'uri_name'),
        api.getEventIdsFromSchedule(internalLeague, { startDate, endDate })
      ])
      const leagueId        = leagueInfo.id
      const arrayOfArrayids = createNestedArrays(ids, 40)

      log.info(`Populating ${ids.length} events for league: ${internalLeague}`)
      log.debug(`Populating the following event IDs: ${ids.join(', ') || 'None'}`)

      await Promise.each(arrayOfArrayids, async idsToQuery => {
        const eventsAry = JSON.parse(await api.getEventsById(internalLeague, idsToQuery))

        await Promise.each(eventsAry, async game => {
          try {
            teams.resetRecord()
            events.resetRecord()

            log.debug("Updating event", game)

            // Check teams for game and whether they exist in the database,
            // insert them if not, otherwise move on to the event data
            const homeTeam      = game.home_team
            const homeStandings = (game.standings) ? game.standings.home : {}
            const awayTeam      = game.away_team
            const awayStandings = (game.standings) ? game.standings.away : {}
            const currScores    = game.box_score
            const top25Rankings = game.top_25_rankings
            const gameOdds      = game.odd

            log.debug("Home Team", homeTeam)
            log.debug("Away Team", awayTeam)
            const homeExists = await teams.findByMultipleColums({ league_id: leagueId, location: homeTeam.medium_name })
            if (homeExists) {
              teams.setRecord({
                current_ranking: (top25Rankings) ? top25Rankings.home : null
              })
            } else {
              let imageNameHome
              const bufferHome = await api.getImageBuffer(homeTeam.logos.small)
              if (bufferHome) {
                imageNameHome = homeTeam.logos.small.split('/')
                imageNameHome = `sports/${internalLeague}/${homeTeam.medium_name}__${imageNameHome[imageNameHome.length - 1]}`
                await aws.writeFile({data: bufferHome, exact_filename: true, filename: imageNameHome})
              }

              teams.setRecord({
                api_uid:                  homeTeam.id,
                league_id:                leagueId,
                current_ranking:          (top25Rankings) ? top25Rankings.home : null,
                location:                 homeTeam.medium_name,
                name:                     homeTeam.full_name,
                full_name:                homeTeam.full_name,
                abbreviation:             homeTeam.abbreviation,
                team_color1:              homeTeam.colour_1,
                team_color2:              homeTeam.colour_2,
                physical_location:        homeTeam.location,
                logo_url:                 homeTeam.logos.small,
                logo_local_filename:      imageNameHome,
                api_url:                  homeTeam.api_uri,
                resource_url:             homeTeam.resource_uri,
                conference_abbreviation:  homeStandings.conference,
                conference_name:          homeStandings.conference_abbreviation
              })
              log.debug("New (home) team to insert", teams.record)
            }
            await teams.save('location')
            const homeTeamId = teams.record.id

            teams.resetRecord()

            const awayExists = await teams.findByColumn(awayTeam.medium_name, 'location')
            if (awayExists) {
              teams.setRecord({
                current_ranking: (top25Rankings) ? top25Rankings.away : null
              })
            } else {
              let imageNameAway
              const bufferAway = await api.getImageBuffer(awayTeam.logos.small)
              if (bufferAway) {
                imageNameAway = awayTeam.logos.small.split('/')
                imageNameAway = `sports/${internalLeague}/${awayTeam.medium_name}__${imageNameAway[imageNameAway.length - 1]}`
                await aws.writeFile({data: bufferAway, exact_filename: true, filename: imageNameAway})
              }

              teams.setRecord({
                api_uid:                  awayTeam.id,
                league_id:                leagueId,
                current_ranking:          (top25Rankings) ? top25Rankings.away : null,
                location:                 awayTeam.medium_name,
                name:                     awayTeam.full_name,
                full_name:                awayTeam.full_name,
                abbreviation:             awayTeam.abbreviation,
                team_color1:              awayTeam.colour_1,
                team_color2:              awayTeam.colour_2,
                physical_location:        awayTeam.location,
                logo_url:                 awayTeam.logos.small,
                logo_local_filename:      imageNameAway,
                api_url:                  awayTeam.api_uri,
                resource_url:             awayTeam.resource_uri,
                conference_abbreviation:  awayStandings.conference,
                conference_name:          awayStandings.conference_abbreviation
              })
              log.debug("New (away) team to insert", teams.record)
            }
            await teams.save('location')
            const awayTeamId = teams.record.id

            // Handle inserting / updating events
            events.setRecord({
              api_uid:              parseInt(game.id),
              league_id:            leagueId,
              home_team_id:         homeTeamId,
              visiting_team_id:     awayTeamId,
              event_type:           game.game_type,
              event_status:         game.event_status,
              home_team_score:      (currScores && currScores.score.home) ? currScores.score.home.score : null,
              visiting_team_score:  (currScores && currScores.score.away) ? currScores.score.away.score : null,
              current_period:       (currScores) ? currScores.progress.segment : null,
              current_clock:        (currScores) ? currScores.progress.clock : null,
              odds_spread:          (gameOdds) ? gameOdds.line : null,
              odds_over_under:      (gameOdds) ? gameOdds.over_under : null,
              event_timestamp:      moment.utc(game.game_date).toDate()
            })
            await events.save('api_uid')

          } catch(err) {
            log.error("Error processing event", err)
          }
        })
      })
    })

    log.info("Successfully updated events!")
    process.exit()

  } catch(err) {
    log.error("Error", err)
    process.exit()
  }
})()
