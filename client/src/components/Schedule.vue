<template lang="pug">
  b-card(no-body,:style="{ borderColor: getTeamColorStyle(team, true) }")
    div.card-text.team
      div.d-flex.flex-column.align-items-center.justify-content-center
        div.text-center(style="font-size:9px;")
          strong
            div
              a(style="color:inherit;text-decoration:underline",:href="'/team/' + this.league + '/' + team.api_uid") {{ (team.current_ranking) ? '(' + team.current_ranking + ')' : '' }} {{ team.full_name }}
        img.img-fluid(:src="'/file/s3/' + team.logo_local_filename")
        div.schedule.d-flex
          ul.list-unstyled
            li(:style="getResultOrStyle(event, team, 'style')",v-for="event in teamSpecificEvents(team.full_name)")
              div.d-flex.flex-row.justify-content-center
                div
                  i {{ getFormattedDate(event.event_timestamp) }}&nbsp;
                div.d-flex.flex-row.justify-content-center
                  div {{ getAtOrVs(event, team) }}&nbsp;
                  div {{ getOtherTeam(event, team) }}&nbsp;
                  div(v-if="getResultOrStyle(event, team)")
                    strong ({{ getResultOrStyle(event, team) }})
</template>

<script>
  import moment from 'moment'
  import TimeHelpers from '../factories/TimeHelpers'

  export default {
    props: ['events', 'league', 'team'],

    methods: {
      getFormattedDate(datetime, format = 'YYYY-MM-DD h:mma') {
        return TimeHelpers.getFormattedDate(datetime, format)
      },

      getAtOrVs(event, team) {
        const homeTeam = event.home_full_name
        // const visitingTeam = event.visiting_full_name
        if (homeTeam == team.full_name) return 'vs'
        return '@'
      },

      getOtherTeam(event, team) {
        const homeTeam = event.home_full_name
        // const homeLoc = event.home_location
        const homeAbbr = event.home_abbreviation
        // const visitingTeam = event.visiting_full_name
        // const visitingLoc = event.visiting_location
        const visitingAbbr = event.visiting_abbreviation
        if (homeTeam == team.full_name) return visitingAbbr
        return homeAbbr
      },

      getResultOrStyle(event, heroTeam, type = 'result') {
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
              return {
                fontWeight: 'bold',
                color: heroTeamScore > villainTeamScore ? 'green' : 'red',
              }
            if (isPlaying) return { fontWeight: 'bold', color: 'orange' }
            if (isGamePostponed || isGameCancelled)
              return { textDecoration: 'italic', color: 'gray' }
            return {}

          default:
            // 'result'
            if (isGameFinal) {
              const wOrL = heroTeamScore > villainTeamScore ? 'W' : 'L'
              return `${wOrL} ${heroTeamScore}-${villainTeamScore}`
            } else {
              const isInPast = moment
                .utc(event.event_timestamp)
                .isBefore(moment())
              if (isGamePostponed || isGameCancelled) {
                return isGamePostponed ? `postponed` : `cancelled`
              } else if (!isInPast) {
                if (type == 'result') return '0-0'
              }
            }
            return `${heroTeamScore}-${villainTeamScore}`
        }
      },

      getTeamColorStyle(team, justColor = false) {
        if (justColor) return `#${team.team_color1}`
        return { color: `#${team.team_color1}` }
      },

      teamSpecificEvents(teamFullName) {
        return this.events.filter((ev) => {
          return (
            ev.home_full_name == teamFullName ||
            ev.visiting_full_name == teamFullName
          )
        })
      },
    },
  }
</script>

<style scoped>
  .team {
    padding: 3px;
  }

  .schedule {
    min-height: 120px;
  }

  .schedule ul {
    margin-bottom: 2px;
  }

  .schedule li {
    /*border-bottom: 1px solid #f0f0f0;*/
    font-size: 8px;
  }

  img {
    max-height: 30px;
  }
</style>
