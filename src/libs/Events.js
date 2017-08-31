import moment from 'moment'
import config from '../config'
import DatabaseModel from './DatabaseModel'

export default function Events(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'events')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'espn_event_id', 'home_team_id', 'visiting_team_id', 'home_team_score',
        'visiting_team_score', 'current_period', 'current_clock', 'event_status',
        'odds_spread', 'odds_over_under', 'event_timestamp'
      ],

      async getAll(latestDate=null) {
        let whereFilter = ''
        let params = []
        if (latestDate) {
          whereFilter = 'where e.event_timestamp <= $1'
          params.push(moment.utc(latestDate).format('YYYY-MM-DD'))
        }

        const { rows } = await postgres.query(`
          select
            th.full_name as home_full_name,
            th.abbreviation as home_abbreviation,
            th.location as home_location,
            th.team_color as home_team_color,
            th.logo_url as home_logo_url,
            th.conference_abbreviation as home_conference_abbreviation,
            tv.full_name as visiting_full_name,
            tv.abbreviation as visiting_abbreviation,
            tv.location as visiting_location,
            tv.team_color as visiting_team_color,
            tv.logo_url as visiting_logo_url,
            tv.conference_abbreviation as visiting_conference_abbreviation,
            e.*
          from events as e
          inner join teams as th on th.id = e.home_team_id
          inner join teams as tv on tv.id = e.visiting_team_id
          ${whereFilter}
          order by e.event_timestamp;
        `, params)
        return rows
      }
    }
  )
}
