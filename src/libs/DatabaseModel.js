import config from '../config'

export default function DatabaseModel(postgres, table) {
  return {
    accessibleColumns: [],
    record: {},

    setRecord(obj) {
      return this.record = Object.assign(this.record, obj)
    },

    resetRecord() {
      return this.record = {}
    },

    async findByColumn(value, column='name') {
      const { rows } = await postgres.query(`select * from ${table} where ${column} = $1`, [value])
      if (rows.length > 0)
        return this.record = rows[0]
      return null
    },

    async findOrCreateByColumn(value, column='name') {
      const check = await this.findByColumn(value, column)
      if (check)
        return this.record = check

      const result = await postgres.query(`insert into ${table} (${column}) values ($1) returning id`, [value])
      const newId = result.rows[0].id
      this.record = { id: newId, [column]: value }
      return this.record
    },

    async save(uniqueColumnIfNoId) {
      const keysInRecord = Object.keys(this.record)
      if (keysInRecord.length > 0) {
        if (this.record.id) {
          let queryAry = [`update ${table} set`]
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

        } else if (this.record[uniqueColumnIfNoId]) {
          const currentRecord = Object.assign({}, this.record)
          await this.findOrCreateByColumn(this.record[uniqueColumnIfNoId], uniqueColumnIfNoId)
          this.record = Object.assign(this.record, currentRecord)
          return await this.save()
        }
      }
      return false
    }
  }
}
