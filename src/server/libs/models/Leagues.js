import config from '../../config'
import DatabaseModel from './DatabaseModel'

export default function Teams(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'leagues')

  return Object.assign(factoryToExtend, {
    accessibleColumns: ['name', 'abbreviation', 'uri_name'],

    async getAllOrdered() {
      const { rows } = await postgres.query(`
        select * from leagues
        order by lower(coalesce(name, uri_name))
      `)
      return rows
    },
  })
}
