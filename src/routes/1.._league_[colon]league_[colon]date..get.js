import { getLeagueAndEventData } from './1.._league_[colon]league..get'

export default async function LeagueWithDate(req, res) {
  await getLeagueAndEventData(req, res)
}
