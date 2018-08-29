import config from '../config'
import DatabaseModel from './DatabaseModel'

export default function Teams(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'leagues')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'name', 'abbreviation', 'uri_name'
      ]
    }
  )
}
