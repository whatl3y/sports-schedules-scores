import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const postgresUrl =
  process.env.DATABASE_URL || 'postgres://localhost:5432/sports'

const postgres = new PostgresClient(postgresUrl, { max: 1 })

;(async () => {
  try {
    await Promise.all([
      createUuidExtension(postgres),
      createLeagues(postgres),
      createTeams(postgres),
      createTeamsIndexes(postgres),
      createEvents(postgres),
      createEventsIndexes(postgres),
      createEventLocationAndTvListingsInEvents(postgres),
      createIsCurrentSeasonInEvents(postgres),
      createCbbConferences(postgres),
      createCbbGames(postgres),
      createCbbGamesPlayers(postgres),
    ])

    log.info('Successfully ran DB migrations!')
    process.exit()
  } catch (err) {
    log.error('Error running DB migrations', err)
    process.exit()
  }
})()

async function createUuidExtension(postgres) {
  await postgres.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)
}

async function createLeagues(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS leagues (
      id serial PRIMARY KEY,
      name varchar(255),
      abbreviation varchar(255),
      uri_name varchar(255),
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
    );
  `)
}

async function createTeams(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id serial PRIMARY KEY,
      api_uid integer,
      league_id integer REFERENCES leagues,
      current_ranking integer,
      location varchar(255),
      name varchar(255),
      full_name varchar(255),
      abbreviation varchar(255),
      physical_location varchar(255),
      team_color1 varchar(255),
      team_color2 varchar(255),
      logo_url varchar(255),
      logo_local_filename varchar(255),
      api_url varchar(255),
      resource_url varchar(255),
      conference_abbreviation varchar(255),
      conference_name varchar(255),
      complete_json text,
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      UNIQUE(league_id, api_uid)
    );
  `)
}

async function createTeamsIndexes(postgres) {
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_league_id on teams (league_id)`
  )
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_api_uid on teams (api_uid)`
  )
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_location on teams (location)`
  )
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_name on teams (name)`
  )
}

async function createEvents(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS events (
      id serial PRIMARY KEY,
      api_uid integer,
      league_id integer REFERENCES leagues,
      home_team_id integer REFERENCES teams,
      visiting_team_id integer REFERENCES teams,
      event_type varchar(255),
      home_team_score integer,
      visiting_team_score integer,
      current_period varchar(255),
      current_clock varchar(255),
      event_status varchar(255),
      odds_spread varchar(255),
      odds_over_under varchar(255),
      event_timestamp timestamp,
      complete_json text,
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      UNIQUE(league_id, api_uid)
    );
  `)
}

async function createEventsIndexes(postgres) {
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS events_league_id on events (league_id)`
  )
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS events_home_team_id on events (home_team_id)`
  )
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS events_visiting_team_id on events (visiting_team_id)`
  )
}

async function createEventLocationAndTvListingsInEvents(postgres) {
  await postgres.addColumnIfNotExists(
    'events',
    'event_location',
    'varchar(255)'
  )
  await postgres.addColumnIfNotExists('events', 'tv_listings', 'text')
}

async function createIsCurrentSeasonInEvents(postgres) {
  await postgres.addColumnIfNotExists('events', 'is_current_season', 'boolean')
  await postgres.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS events_is_current_season on events (is_current_season)`
  )
}

async function createCbbConferences(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS cbb_conferences (
      id serial PRIMARY KEY,
      name varchar(255),
      abbrev varchar(50),
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      UNIQUE(name)
    );
  `)
}

async function createCbbGames(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS cbb_games (
      id serial PRIMARY KEY,
      game_id uuid,
      season INTEGER,
      status VARCHAR(255),
      coverage VARCHAR(255),
      neutral_site BOOLEAN,
      scheduled_date DATE,
      gametime TIMESTAMP,
      conference_game BOOLEAN,
      tournament VARCHAR(255),
      tournament_type VARCHAR(255),
      tournament_round VARCHAR(255),
      tournament_game_no VARCHAR(255),
      attendance INTEGER,
      lead_changes INTEGER,
      times_tied INTEGER,
      periods INTEGER,
      possession_arrow VARCHAR(255),
      venue_id VARCHAR(255),
      venue_city VARCHAR(255),
      venue_state VARCHAR(255),
      venue_address VARCHAR(255),
      venue_zip VARCHAR(255),
      venue_country VARCHAR(255),
      venue_name VARCHAR(255),
      venue_capacity INTEGER,
      h_name VARCHAR(255),
      h_market VARCHAR(255),
      h_id VARCHAR(255),
      h_alias VARCHAR(255),
      h_league_id VARCHAR(255),
      h_league_name VARCHAR(255),
      h_league_alias VARCHAR(255),
      h_conf_id VARCHAR(255),
      h_conf_name VARCHAR(255),
      h_conf_alias VARCHAR(255),
      h_division_id VARCHAR(255),
      h_division_name VARCHAR(255),
      h_division_alias VARCHAR(255),
      h_logo_large VARCHAR(255),
      h_logo_medium VARCHAR(255),
      h_logo_small VARCHAR(255),
      h_points_game INTEGER,
      h_rank INTEGER,
      h_minutes VARCHAR(255),
      h_field_goals_made INTEGER,
      h_field_goals_att INTEGER,
      h_field_goals_pct FLOAT,
      h_three_points_made INTEGER,
      h_three_points_att INTEGER,
      h_three_points_pct FLOAT,
      h_two_points_made INTEGER,
      h_two_points_att INTEGER,
      h_two_points_pct FLOAT,
      h_blocked_att INTEGER,
      h_free_throws_made INTEGER,
      h_free_throws_att INTEGER,
      h_free_throws_pct FLOAT,
      h_offensive_rebounds INTEGER,
      h_defensive_rebounds INTEGER,
      h_rebounds INTEGER,
      h_assists INTEGER,
      h_turnovers INTEGER,
      h_steals INTEGER,
      h_blocks INTEGER,
      h_assists_turnover_ratio FLOAT,
      h_personal_fouls INTEGER,
      h_ejections INTEGER,
      h_foulouts INTEGER,
      h_points INTEGER,
      h_fast_break_pts INTEGER,
      h_second_chance_pts INTEGER,
      h_team_turnovers INTEGER,
      h_points_off_turnovers INTEGER,
      h_team_rebounds INTEGER,
      h_flagrant_fouls INTEGER,
      h_player_tech_fouls INTEGER,
      h_team_tech_fouls INTEGER,
      h_coach_tech_fouls INTEGER,
      a_name VARCHAR(255),
      a_market VARCHAR(255),
      a_id VARCHAR(255),
      a_alias VARCHAR(255),
      a_league_id VARCHAR(255),
      a_league_name VARCHAR(255),
      a_league_alias VARCHAR(255),
      a_conf_id VARCHAR(255),
      a_conf_name VARCHAR(255),
      a_conf_alias VARCHAR(255),
      a_division_id VARCHAR(255),
      a_division_name VARCHAR(255),
      a_division_alias VARCHAR(255),
      a_logo_large VARCHAR(255),
      a_logo_medium VARCHAR(255),
      a_logo_small VARCHAR(255),
      a_points_game INTEGER,
      a_rank INTEGER,
      a_minutes VARCHAR(255),
      a_field_goals_made INTEGER,
      a_field_goals_att INTEGER,
      a_field_goals_pct FLOAT,
      a_three_points_made INTEGER,
      a_three_points_att INTEGER,
      a_three_points_pct FLOAT,
      a_two_points_made INTEGER,
      a_two_points_att INTEGER,
      a_two_points_pct FLOAT,
      a_blocked_att INTEGER,
      a_free_throws_made INTEGER,
      a_free_throws_att INTEGER,
      a_free_throws_pct FLOAT,
      a_offensive_rebounds INTEGER,
      a_defensive_rebounds INTEGER,
      a_rebounds INTEGER,
      a_assists INTEGER,
      a_turnovers INTEGER,
      a_steals INTEGER,
      a_blocks INTEGER,
      a_assists_turnover_ratio FLOAT,
      a_personal_fouls INTEGER,
      a_ejections INTEGER,
      a_foulouts INTEGER,
      a_points INTEGER,
      a_fast_break_pts INTEGER,
      a_second_chance_pts INTEGER,
      a_team_turnovers INTEGER,
      a_points_off_turnovers INTEGER,
      a_team_rebounds INTEGER,
      a_flagrant_fouls INTEGER,
      a_player_tech_fouls INTEGER,
      a_team_tech_fouls INTEGER,
      a_coach_tech_fouls INTEGER,
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now(),

      UNIQUE(game_id)
    );
  `)
}

async function createCbbGamesPlayers(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS cbb_games_players (
      id serial PRIMARY KEY,
      game_id uuid,
      season INTEGER,
      neutral_site BOOLEAN,
      scheduled_date DATE,
      gametime TIMESTAMP,
      tournament VARCHAR(255),
      tournament_type VARCHAR(255),
      tournament_round VARCHAR(255),
      tournament_game_no VARCHAR(255),
      player_id VARCHAR(255),
      last_name VARCHAR(255),
      first_name VARCHAR(255),
      full_name VARCHAR(255),
      abbr_name VARCHAR(255),
      status VARCHAR(255),
      jersey_number INTEGER,
      height INTEGER,
      weight INTEGER,
      birth_place VARCHAR(255),
      birthplace_city VARCHAR(255),
      birthplace_state VARCHAR(255),
      birthplace_country VARCHAR(255),
      class VARCHAR(255),
      team_name VARCHAR(255),
      team_market VARCHAR(255),
      team_id VARCHAR(255),
      team_alias VARCHAR(255),
      conf_name VARCHAR(255),
      conf_alias VARCHAR(255),
      division_name VARCHAR(255),
      division_alias VARCHAR(255),
      league_name VARCHAR(255),
      home_team BOOLEAN,
      active BOOLEAN,
      played BOOLEAN,
      starter BOOLEAN,
      minutes VARCHAR(255),
      minutes_int64 INTEGER,
      position VARCHAR(255),
      primary_position VARCHAR(255),
      field_goals_made INTEGER,
      field_goals_att INTEGER,
      field_goals_pct FLOAT,
      three_points_made INTEGER,
      three_points_att INTEGER,
      three_points_pct FLOAT,
      two_points_made INTEGER,
      two_points_att INTEGER,
      two_points_pct FLOAT,
      blocked_att INTEGER,
      free_throws_made INTEGER,
      free_throws_att INTEGER,
      free_throws_pct FLOAT,
      offensive_rebounds INTEGER,
      defensive_rebounds INTEGER,
      rebounds INTEGER,
      assists INTEGER,
      turnovers INTEGER,
      steals INTEGER,
      blocks INTEGER,
      assists_turnover_ratio FLOAT,
      personal_fouls INTEGER,
      tech_fouls INTEGER,
      flagrant_fouls INTEGER,
      points INTEGER,
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now(),

      FOREIGN KEY (game_id) REFERENCES cbb_games (game_id),
      UNIQUE(game_id, player_id)
    );
  `)
}
