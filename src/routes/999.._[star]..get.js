import bunyan from 'bunyan'
import Slack from '../libs/Slack'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

export default async function Index(req, res) {
  try {
    await Slack.send(`Someone visited the main page -- IP: ${req.ip}, hostname: ${req.hostname}, User-Agent: ${req.headers['user-agent']}`)
  } catch(err) {
    log.error("Error sending slack message", err)
  }

  res.render('index', {})
}
