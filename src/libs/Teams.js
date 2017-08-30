import config from '../config'
import DatabaseModel from './DatabaseModel'

export default function Teams(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'teams')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'location', 'name', 'full_name', 'abbreviation',
        'team_color', 'logo_url', 'stats_url', 'schedule_url', 'scores_url',
        'conference_abbreviation', 'conference_name'
      ]
    }
  )
}
