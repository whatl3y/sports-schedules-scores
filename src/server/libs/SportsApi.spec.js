import assert from 'assert'
import moment from 'moment'
import SportsApi from './SportsApi'

describe('CfbApi', () => {
  const api = SportsApi()

  describe('#getLeagueSchedule', () => {
    it('should get a valid response without errors', async function() {
      this.timeout(5000)
      const res = await api.getLeagueSchedule('mlb')
      const parsedRes = JSON.parse(res)

      assert.equal(true, typeof res === 'string')
      assert.equal(true, typeof parsedRes === 'object')
      assert.equal(true, parsedRes['current_season'] instanceof Array)
      assert.equal(true, parsedRes['current_season'][0]['event_ids'] instanceof Array)
    })
  })

  describe('#getEventIdsFromSchedule', () => {
    it('should get a single array of IDs (integers)', async function() {
      this.timeout(5000)
      const ids = await api.getEventIdsFromSchedule('mlb')

      assert.equal(true, ids instanceof Array)
      assert.equal(true, ids.length > 0)
    })

    it('should return an empty array with dates out of range of what API will return', async function() {
      this.timeout(5000)
      const ids1 = await api.getEventIdsFromSchedule('mlb', { startDate: moment().add(5, 'years').toDate() })
      const ids2 = await api.getEventIdsFromSchedule('mlb', { endDate: moment().subtract(5, 'years').toDate() })

      assert.equal(true, ids1 instanceof Array)
      assert.equal(true, ids2 instanceof Array)
      assert.equal(0, ids1.length)
      assert.equal(0, ids2.length)
    })
  })

  describe('#getEventsById', () => {
    it('should get an array of events', async function() {
      this.timeout(5000)
      const res = await api.getEventsById('mlb', [ 62106, 62100 ])
      const parsedRes = JSON.parse(res)

      assert.equal(true, typeof res === 'string')
      assert.equal(true, parsedRes instanceof Array)
      assert.equal(2, parsedRes.length)
    })
  })
})
