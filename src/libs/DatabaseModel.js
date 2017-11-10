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

    async getAll() {
      const { rows } = await postgres.query(`select * from ${table}`)
      return rows
    },

    async findByColumn(value, column='name') {
      const { rows } = await postgres.query(`select * from ${table} where ${column} = $1`, [value])
      if (rows.length > 0)
        return this.record = rows[0]
      return null
    },

    // Uses AND logic between columns
    // Ex. keyValuePairs = { col1: 'val1', col2: 'col2', ... }
    async findByMultipleColums(keyValuePairs) {
      const columnAry     = Object.keys(keyValuePairs)
      const paramsAry     = []
      const filters       = columnAry.map((col, ind) => {
        paramsAry.push(keyValuePairs[col])
        return `${col} = $${ind + 1}`
      })
      const filterString  = filters.join(' AND ')
      const { rows }      = await postgres.query(`select * from ${table} where ${filterString}`, paramsAry)
      if (rows.length > 0)
        return this.record = rows[0]
      return null
    },

    // Ex. keyValuePairs = { col1: 'val1', col2: 'col2', ... }
    async findOrCreateBy(keyValuePairs) {
      const check = await this.findByMultipleColums(keyValuePairs)
      if (check)
        return this.record = check

      this.record   = Object.assign(this.record, keyValuePairs)
      const result  = await this.save()
      const newId   = result.rows[0].id
      this.record   = Object.assign(this.record, { id: newId })
      return this.record
    },

    async save(uniqueColumnIfNoId=null) {
      const keysInRecord = Object.keys(this.record)
      if (keysInRecord.length > 0) {
        let queryAry,
            paramsAry = [],
            paramIndTracker = 1

        if (this.record.id) {
          queryAry = [`update ${table} set`]

          keysInRecord.forEach(key => {
            if (this.accessibleColumns.indexOf(key) === -1) return

            queryAry.push(`${key} = $${paramIndTracker},`)
            paramsAry.push(this.record[key])
            paramIndTracker++
          })
          if (paramsAry.length === 0) return false

          queryAry.push(`updated_at = now() at time zone 'utc'`)
          queryAry.push(`where id = $${paramIndTracker}`)
          paramsAry.push(this.record.id)

          const queryString = queryAry.join(' ')
          return await postgres.query(queryString, paramsAry)

        } else if (uniqueColumnIfNoId && this.record[uniqueColumnIfNoId]) {
          const currentRecord = Object.assign({}, this.record)
          await this.findOrCreateBy({ [uniqueColumnIfNoId]: this.record[uniqueColumnIfNoId] })
          this.record = Object.assign(this.record, currentRecord)
          return await this.save()

        } else { // insert new record
          queryAry = [`insert into ${table} (`]
          let paramList = []

          keysInRecord.forEach(key => {
            if (this.accessibleColumns.indexOf(key) === -1) return

            queryAry.push(`${key},`)
            paramList.push(`$${paramIndTracker}`)
            paramsAry.push(this.record[key])
            paramIndTracker++
          })

          queryAry.push(`created_at, updated_at) values (${paramList.join(',')}, now() at time zone 'utc', now() at time zone 'utc') returning id`)
          const qs = queryAry.join(' ')
          return await postgres.query(qs, paramsAry)
        }
      }
      return false
    }
  }
}
