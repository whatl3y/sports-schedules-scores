import bunyan from 'bunyan'
import GeoIp from '../libs/GeoIp'
import Slack from '../libs/Slack'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

export default async function Index(req, res) {
  res.render('index', {})

  try {
    let realClientIpAddress = (req.headers['x-forwarded-for'] || req.ip).split(',')
    realClientIpAddress = realClientIpAddress[realClientIpAddress.length - 1]
    const location = await GeoIp.location(realClientIpAddress)
    await Slack.send(`Someone visited the main page -- IP: ${realClientIpAddress} (location: ${location.city}, ${location.region_code}), hostname: ${req.hostname}, User-Agent: ${req.headers['user-agent']}`)
  } catch(err) {
    log.error("Error sending slack message", err)
  }
}
