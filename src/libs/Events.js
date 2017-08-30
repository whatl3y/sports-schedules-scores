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
      ]
    }
  )
}
