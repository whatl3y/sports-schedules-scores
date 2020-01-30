import { IncomingWebhook } from '@slack/webhook'
import config from '../config'

export default function Slack(webhookUrl=config.slack.webhookUrl) {
  return {
    webhook: (!!webhookUrl) ? new IncomingWebhook(webhookUrl) : null,

    setUrl(newUrl) {
      return this.webhook = new IncomingWebhook(newUrl)
    },

    async send(text) {
      if (!this.webhook)
        return
      return await this.webhook.send({ text })
    }
  }
}