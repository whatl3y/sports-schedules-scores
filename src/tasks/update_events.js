import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Teams from '../libs/Teams'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

const postgres = new PostgresClient()
const teams = Teams(postgres)

;(async () => {
  try {


    log.info("Successfully ran DB migrations!")
    process.exit()

  } catch(err) {
    log.error("Error running DB migrations", err)
    process.exit()
  }
})()
