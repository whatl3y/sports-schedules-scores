import brain from 'brain.js'
import bunyan from 'bunyan'
import moment from 'moment'
import PostgresClient from '../libs/PostgresClient'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

const postgres = new PostgresClient()

;(async () => {
  try {
    const { rows } = await postgres.query(`
      select
        ch.id as h_conf,
        ca.id as a_conf,
        g.scheduled_date,
        coalesce(g.h_rank, 0) as h_rank,
        coalesce(g.a_rank, 0) as a_rank,
        coalesce(g.h_field_goals_att, 0) as h_field_goals_att,
        coalesce(g.h_field_goals_made, 0) as h_field_goals_made,
        coalesce(g.a_field_goals_att, 0) as a_field_goals_att,
        coalesce(g.a_field_goals_made, 0) as a_field_goals_made,
        coalesce(g.h_three_points_att, 0) as h_three_points_att,
        coalesce(g.h_three_points_made, 0) as h_three_points_made,
        coalesce(g.a_three_points_att, 0) as a_three_points_att,
        coalesce(g.a_three_points_made, 0) as a_three_points_made,
        coalesce(g.h_two_points_att, 0) as h_two_points_att,
        coalesce(g.h_two_points_made, 0) as h_two_points_made,
        coalesce(g.a_two_points_att, 0) as a_two_points_att,
        coalesce(g.a_two_points_made, 0) as a_two_points_made,
        coalesce(g.h_blocked_att, 0) as h_blocked_att,
        coalesce(g.a_blocked_att, 0) as a_blocked_att,
        coalesce(g.h_rebounds, 0) as h_rebounds,
        coalesce(g.a_rebounds, 0) as a_rebounds,
        ph1.count_players_played as h_count_players_played,
        pa1.count_players_played as a_count_players_played,

        g.h_points_game,
        g.a_points_game
      from cbb_games as g
      inner join cbb_conferences as ch on ch.name = g.h_conf_name
      inner join cbb_conferences as ca on ca.name = g.a_conf_name
      inner join (
        select
          p.game_id,
          count(*)::integer as count_players_played
        from cbb_games_players as p
        where
          p.played is true and
          p.home_team is true
        group by p.game_id
      ) as ph1 on g.game_id = ph1.game_id
      inner join (
        select
          p.game_id,
          count(*)::integer as count_players_played
        from cbb_games_players as p
        where
          p.played is true and
          p.home_team is not true
        group by p.game_id
      ) as pa1 on g.game_id = pa1.game_id
      where coalesce(g.h_field_goals_att, 0) <> 0
      -- limit 2000
    `)

    const trainingData = rows.map(row => {
      return {
        input: [
          parseInt(moment(row.scheduled_date).format('M')),
          row.h_conf,
          row.a_conf,
          row.h_rank,
          row.a_rank,
          row.h_field_goals_att,
          row.h_field_goals_made,
          row.a_field_goals_att,
          row.a_field_goals_made,
          row.h_three_points_att,
          row.h_three_points_made,
          row.a_three_points_att,
          row.a_three_points_made,
          row.h_two_points_att,
          row.h_two_points_made,
          row.a_two_points_att,
          row.a_two_points_made,
          row.h_blocked_att,
          row.a_blocked_att,
          row.h_rebounds,
          row.a_rebounds,
          row.h_count_players_played,
          row.a_count_players_played
        ],
        output: [
          row.h_points_game,
          row.a_points_game
        ]
      }
    })

    const net = new brain.NeuralNetwork({
      activation: 'sigmoid', // activation function
      // learningRate: 0.6,
      hiddenLayers: [
        ...new Array(3).fill(trainingData[0].input.length * 2),
        ...new Array(3).fill(Math.round(trainingData[0].input.length * (3/2))),
        ...new Array(2).fill(trainingData[0].input.length * 1),
        ...new Array(2).fill(Math.round(trainingData[0].input.length / 2)),
        ...new Array(1).fill(Math.round(trainingData[0].input.length / 3)),
        ...new Array(1).fill(Math.round(trainingData[0].input.length / 4))
      ]
    })
    const res = await net.trainAsync(trainingData, {
      iterations: 100,
      log: true
    })

    console.log("Network output", res, net.toJSON())
    log.info("Successfully finished!")
    process.exit()

  } catch(err) {
    log.error("Error", err)
    process.exit()
  }
})()
