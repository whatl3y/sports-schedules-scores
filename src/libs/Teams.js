import config from '../config'

const NOOP = ()=>{}

export default function Teams(postgres) {
  return {
    record: {},
    accessibleColumns: [
      'location', 'name', 'full_name', 'abbreviation',
      'team_color', 'logo_url', 'stats_url', 'schedule_url', 'scores_url',
      'conference_abbreviation', 'conference_name'
    ],

    setRecord(obj) {
      return this.record = Object.assign(this.record, obj)
    },

    async findOrCreateByColumn(value, column='name') {
      const { rows } = await postgres.query(`select * from teams where ${column} = $1`, [value])
      if (rows.length > 0)
        return this.record = rows[0]

      const result = await postgres.query(`insert into teams (${column}) values ($1) returning id`, [value])
      const newId = result.rows[0].id
      this.record = { id: newId, [column]: value }
      return this.record
    },

    async save() {
      const keysInRecord = Object.keys(this.record)
      if (keysInRecord.length > 0) {
        if (this.record.id) {
          let queryAry = ['update teams set']
          let paramsAry = []
          let paramIndTracker = 1

          keysInRecord.forEach(key => {
            if (this.accessibleColumns.indexOf(key) === -1) return

            queryAry.push(`${key} = $${paramIndTracker},`)
            paramsAry.push(this.record[key])
            paramIndTracker++
          })
          if (paramsAry.length === 0) return false

          queryAry.push('updated_at = now()')
          queryAry.push(`where id = $${paramIndTracker}`)
          paramsAry.push(this.record.id)

          const queryString = queryAry.join(' ')
          const { rows } = await postgres.query(queryString, paramsAry)
          return true

        } else if (this.record.name) {
          const currentRecord = Object.assign({}, this.record)
          await this.findOrCreateByColumn(this.record.name)
          this.record = Object.assign(this.record, currentRecord)
          return await this.save()
        }
      }
      return false
    }
  }
}
