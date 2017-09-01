import config from '../config'
import DatabaseModel from './DatabaseModel'

export default function Teams(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'teams')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'location', 'name', 'full_name', 'abbreviation',
        'team_color', 'logo_url', 'logo_local_filename', 'stats_url',
        'schedule_url', 'scores_url', 'conference_abbreviation', 'conference_name'
      ],

      async getAll() {
        const { rows } = await postgres.query(`
          select e.event_timestamp as event_time_today, t.*
          from teams as t
          left outer join events as e on (e.home_team_id = t.id or e.visiting_team_id = t.id) and (e.event_timestamp::timestamp without time zone AT TIME ZONE 'UTC-8')::date = (now()::timestamp without time zone AT TIME ZONE 'UTC-8')::date
          `)
        return rows
      },

      async getAllConferences() {
        const { rows } = await postgres.query(`
          select distinct conference_abbreviation
          from teams
          order by conference_abbreviation
          `)
        return rows
      }
    }
  )
}
