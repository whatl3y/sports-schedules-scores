import bunyan from 'bunyan'
import Slack from '../libs/Slack'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

export default async function Index(req, res) {
  try {
    let realClientIpAddress = (req.headers['x-forwarded-for'] || req.ip).split(',')
    realClientIpAddress = realClientIpAddress[realClientIpAddress.length - 1]
    await Slack.send(`Someone visited the main page -- IP: ${realClientIpAddress}, hostname: ${req.hostname}, User-Agent: ${req.headers['user-agent']}`)
  } catch(err) {
    log.error("Error sending slack message", err)
  }

  res.render('index', {})
}
