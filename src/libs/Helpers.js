import moment from 'moment'

export function flatten(ary) {
  const nestedFlattened = ary.map((v) => {
    if (v instanceof Array) return flatten(v)
    return v
  })
  return [].concat.apply([], nestedFlattened)
}

export function createNestedArrays(ary, length = 10) {
  const aryCopy = ary.slice(0)
  let nestedArys = []

  while (aryCopy.length > 0) {
    nestedArys.push(aryCopy.splice(0, length))
  }
  return nestedArys
}

export function getFormattedDate(datetime, format = 'YYYY-MM-DD h:mma') {
  return moment(datetime).format(format)
}

export function getTimeFromNow(time) {
  return moment(time).fromNow()
}

export function getAtOrVs(event, team) {
  const homeTeam = event.home_full_name
  // const visitingTeam = event.visiting_full_name
  if (homeTeam == team.full_name) return 'vs'
  return '@'
}

export function getOtherTeam(event, team) {
  const homeTeam = event.home_full_name
  // const homeLoc = event.home_location
  const homeAbbr = event.home_abbreviation
  // const visitingTeam = event.visiting_full_name
  // const visitingLoc = event.visiting_location
  const visitingAbbr = event.visiting_abbreviation
  if (homeTeam == team.full_name) return visitingAbbr
  return homeAbbr
}

export function getResultOrStyle(event, heroTeam, type = 'result') {
  const isGameFinal = event.event_status === 'final'
  const isGamePostponed = event.event_status === 'postponed'
  const isGameCancelled = event.event_status === 'cancelled'
  const isPlaying = event.event_status === 'progress'

  const homeTeam = event.home_full_name
  const homeTeamScore = event.home_team_score
  // const visitingTeam = event.visiting_full_name
  const visitingTeamScore = event.visiting_team_score

  let heroTeamScore, villainTeamScore
  if (homeTeam == heroTeam.full_name) {
    heroTeamScore = homeTeamScore || 0
    villainTeamScore = visitingTeamScore || 0
  } else {
    heroTeamScore = visitingTeamScore || 0
    villainTeamScore = homeTeamScore || 0
  }

  switch (type) {
    case 'style':
      if (isGameFinal)
        return `font-weight: bold; color: ${
          heroTeamScore > villainTeamScore ? 'green' : 'red'
        }`
      if (isPlaying) return `font-weight: bold; color: orange`
      if (isGamePostponed || isGameCancelled)
        return `text-decoration: italic; color: gray`
      return ''

    default:
      // 'result'
      if (isGameFinal) {
        const wOrL = heroTeamScore > villainTeamScore ? 'W' : 'L'
        return `${wOrL} ${heroTeamScore}-${villainTeamScore}`
      } else {
        const isInPast = moment.utc(event.event_timestamp).isBefore(moment())
        if (isGamePostponed || isGameCancelled) {
          return isGamePostponed ? `postponed` : `cancelled`
        } else if (!isInPast) {
          if (type == 'result') return '0-0'
        }
      }
      return `${heroTeamScore}-${villainTeamScore}`
  }
}

export function getTeamColorStyle(team, justColor = false) {
  if (justColor) return `#${team.team_color1}`
  return `color: #${team.team_color1}`
}

export function teamSpecificEvents(events, teamFullName) {
  return events.filter((ev) => {
    return (
      ev.home_full_name == teamFullName || ev.visiting_full_name == teamFullName
    )
  })
}
