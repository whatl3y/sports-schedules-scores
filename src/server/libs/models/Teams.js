import config from '../../config'
import DatabaseModel from './DatabaseModel'

export default function Teams(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'teams')

  return Object.assign(factoryToExtend, {
    accessibleColumns: [
      'api_uid',
      'league_id',
      'current_ranking',
      'location',
      'name',
      'full_name',
      'abbreviation',
      'physical_location',
      'team_color1',
      'team_color2',
      'logo_url',
      'logo_local_filename',
      'api_url',
      'resource_url',
      'conference_abbreviation',
      'conference_name',
      'complete_json',
    ],

    async getAll(leagueId, searchTerm = null) {
      const { rows } = await postgres.query(
        `
          select e.event_timestamp as event_time_today, t.*
          from teams as t
          left outer join events as e on (e.home_team_id = t.id or e.visiting_team_id = t.id) and (e.event_timestamp::timestamp without time zone AT TIME ZONE 'UTC-8')::date = (now()::timestamp without time zone AT TIME ZONE 'UTC-8')::date
          where
            t.league_id = $1
            ${
              searchTerm
                ? `and (t.name ilike '%' || $2 || '%' or t.full_name ilike '%' || $2 || '%')`
                : ``
            }
        `,
        [leagueId].concat(searchTerm ? [searchTerm] : [])
      )
      return rows
    },

    async getAllConferences(leagueId) {
      const { rows } = await postgres.query(
        `
          select distinct conference_abbreviation
          from teams
          where league_id = $1
          order by conference_abbreviation
        `,
        [leagueId]
      )
      return rows
    },
  })
}
