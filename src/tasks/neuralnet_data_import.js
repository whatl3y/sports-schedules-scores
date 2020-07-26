import brain from 'brain.js'
import { BigQuery } from '@google-cloud/bigquery'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import CbbGames from '../libs/models/CbbGames'
import CbbGamesPlayers from '../libs/models/CbbGamesPlayers'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

const postgres = new PostgresClient()

;(async () => {
  try {
    const bigquery = new BigQuery({
      keyFilename: '/Users/lancewhatley/Downloads/sports-d9216169f873.json',
      projectId: `sports-267000`
    })

    // await addGames(bigquery, postgres)
    await addGamesPlayers(bigquery, postgres)

    log.info("Successfully finished!")
    process.exit()

  } catch(err) {
    log.error("Error", err)
    process.exit()
  }
})()

async function addGames(bigquery, postgres) {
  // Retrieve table reference
  const [rows] = await bigquery.query({
    query: `
      SELECT *
      FROM \`bigquery-public-data.ncaa_basketball.mbb_games_sr\`;
    `,

    location: 'US'
  })

  await Promise.all(
    rows.map(async row => {
      const keyValPairs = Object.keys(row).reduce((obj, key) => {
        return {
          ...obj,
          [key]: (row[key] && row[key].value) ? row[key].value : row[key]
        }
      }, {})
      const cbbGames = CbbGames(postgres)
      await cbbGames.findOrCreateBy({ game_id: keyValPairs.game_id })

      cbbGames.setRecord(keyValPairs)
      await cbbGames.save()
    })
  )
}
async function addGamesPlayers(bigquery, postgres) {
  const limit = 1e5

  let i = 0
  let hasMoreRows = true
  while (hasMoreRows) {
    const [rows] = await bigquery.query({
      query: `
        SELECT *
        FROM \`bigquery-public-data.ncaa_basketball.mbb_players_games_sr\`
        ORDER BY game_id, player_id
        LIMIT ${limit}
        OFFSET ${i * limit};
      `,
  
      location: 'US'
    })
  
    await Promise.all(
      rows.map(async row => {
        const keyValPairs = Object.keys(row).reduce((obj, key) => {
          return {
            ...obj,
            [key]: (row[key] && row[key].value) ? row[key].value : row[key]
          }
        }, {})
        const cbbPl = CbbGamesPlayers(postgres)
        await cbbPl.findOrCreateBy({ game_id: keyValPairs.game_id, player_id: keyValPairs.player_id })
  
        cbbPl.setRecord(keyValPairs)
        await cbbPl.save()
      })
    )

    if (rows.length < 100000)
      hasMoreRows = false
    else
      i++

    console.log(`Finished game teams iteration: ${i}`)
  }
}