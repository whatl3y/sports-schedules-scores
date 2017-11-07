import request from 'request-promise-native'
import moment from 'moment'
import { flatten } from './Helpers'
import config from '../config'

export default function CfbApi(host=config.sports_api.host) {
  return {
    request: request.defaults({ baseUrl: host }),
    leagues: [
      'nfl', 'nba', 'mlb', 'mls', 'nhl', 'wjhc', 'cfl', 'ncaaf',
      'ncaab', 'uefa', 'chlg', 'epl', 'bund', 'liga', 'seri', 'fran'
    ],

    async getLeagueSchedule(league) {
      if (this.isValidLeague(league)) {
        const path = `/${league}/schedule`
        return await this.request.get(path)
      }
      return false
    },

    async getEventIdsFromSchedule(league, { startDate, endDate } = { startDate:null, endDate:null }) {
      const response = await this.getLeagueSchedule(league)
      if (response) {
        return this.parseEventIdsFromScheduleResponse(response, { startDate, endDate })
      }
      return false
    },

    async getEventsById(league, idOrAryOfIds) {
      if (this.isValidLeague(league)) {
        const queryStringVal = (idOrAryOfIds instanceof Array) ? idOrAryOfIds.join(',') : idOrAryOfIds
        const path = `/${league}/events?id.in=${queryStringVal}`
        return await this.request.get(path)
      }
      return false
    },

    async getImageBuffer(imageUrl) {
      if (imageUrl)
        return await request.get(imageUrl, { encoding: null })
      return false
    },

    isValidLeague(league) {
      return this.leagues.indexOf(league) > -1
    },

    parseEventIdsFromScheduleResponse(response, { startDate, endDate } = { startDate:null, endDate:null }) {
      response = (typeof response === 'string') ? JSON.parse(response) : response
      const nestedEventIds = response.current_season.map(dateData => {
        if (startDate && moment(moment(dateData['start_date']).format('YYYY-MM-DD')).isBefore(startDate))
          return []

        if (endDate && moment(moment(dateData['end_date']).format('YYYY-MM-DD')).isAfter(endDate))
          return []

        return dateData['event_ids']
      })
      return flatten(nestedEventIds)
    }
  }
}
