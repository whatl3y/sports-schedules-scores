import assert from 'assert'
import CfbApi from './CfbApi'

describe('CfbApi', () => {
  const api = CfbApi('https://cfb-scoreboard-api.herokuapp.com')

  describe('#getEventsByDate', () => {
    it('should get a valid JSON response with appropriate parameters without erroring', async function() {
      this.timeout(5000)
      const response = await api.getEventsByDate('2016-01-11')

      assert.equal(true, typeof response.url === 'string')
      assert.equal(true, response.games instanceof Array)
      assert.equal(1, response.games.length)
    })
  })
})
