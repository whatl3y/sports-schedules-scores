import { IncomingWebhook } from '@slack/client'
import config from '../config'

export default {
  webhook: new IncomingWebhook(config.slack.webhookUrl),

  send(content) {
    return new Promise((resolve, reject) => {
      this.webhook.send(content, (err, header, statusCode, body) => {
        if (err) return reject(err)
        if (statusCode >= 400) return reject(body)
        resolve(body)
      })
    })
  }
}
