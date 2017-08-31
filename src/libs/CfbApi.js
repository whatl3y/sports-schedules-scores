import request from 'request'
import moment from 'moment'
import config from '../config'

export default function CfbApi(host=config.cfbapi.host) {
  return {
    request: request.defaults({ baseUrl: host }),

    getEventsByDate(date) {
      return new Promise((resolve, reject) => {
        const formattedDate = moment(date).format('YYYYMMDD')
        this.request.get({ url: `/v1/date/${formattedDate}` }, (err, httpResponse, body) => {
          if (err) return reject(err)
          if (httpResponse.statusCode !== 200) return reject(body)

          resolve(JSON.parse(body))
        })
      })
    },

    getImageBuffer(imageUrl) {
      return new Promise((resolve, reject) => {
        request.get(imageUrl, { encoding: null }, (err, httpResponse, body) => {
          if (err) return reject(err)
          if (httpResponse.statusCode >= 400) return reject(body)

          resolve(body)
        })
      })
    }
  }
}
