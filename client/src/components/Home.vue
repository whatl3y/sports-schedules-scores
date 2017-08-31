<template lang="pug">
  div.container-fluid
    h1.text-center CFB Schedules and Scores
    div.row
      div.col-12.col-md-6.offset-md-3.col-lg-4.offset-lg-4
        b-form-input(v-model="filter",placeholder="Find a team...")
    div.d-flex.flex-row.justify-content-center.flex-wrap
      div.event(:style="getTeamColorStyle(team)",v-for="team in filteredTeams")
        b-card(no-body)
          div.card-text.team
            div.d-flex.flex-column.align-items-center.justify-content-center
              div.text-center(style="font-size:9px;")
                strong
                  div {{ team.location }}
                  div {{ team.name }}
              img.img-fluid(:src="team.logo_url")
              div.schedule.d-flex
                ul.list-unstyled
                  li(:style="getResultOrStyle(event, team, 'style')",v-for="event in teamSpecificEvents(team.full_name)")
                    div.d-flex.flex-row.justify-content-center
                      div
                        i {{ getFormattedDate(event.event_timestamp) }} -&nbsp;
                      div.d-flex.flex-row.justify-content-center
                        div {{ getAtOrVs(event, team) }}&nbsp;
                        div {{ getOtherTeam(event, team) }}&nbsp;
                        div(v-if="getResultOrStyle(event, team)")
                          strong ({{ getResultOrStyle(event, team) }})
</template>

<script>
  import moment from 'moment'
  import TimeHelpers from '../factories/TimeHelpers'
  import Snackbar from '../factories/Snackbar'
  import CfbData from '../factories/CfbData'

  export default {
    data() {
      return {
        filter: null,
        teams: [],
        events: []
      }
    },

    computed: {
      filteredTeams() {
        if (this.filter)
          return this.teams.filter(t => t.full_name.toLowerCase().indexOf(this.filter.toLowerCase()) > -1)
        return this.teams
      }
    },

    methods: {
      getTimeFromNow:   TimeHelpers.getTimeFromNow,
      relativeDate:     TimeHelpers.getTimeDifferenceFromUnits,

      getFormattedDate(datetime, format='MM/DD/YYYY h:mm a') {
        if (parseInt(moment.utc(datetime).format('H')) >= 0 && parseInt(moment.utc(datetime).format('H')) <= 9)
          format = 'MM/DD/YYYY'
        return TimeHelpers.getFormattedDate(datetime, format)
      },

      getAtOrVs(event, team) {
        const homeTeam = event.home_full_name
        const visitingTeam = event.visiting_full_name
        if (homeTeam == team.full_name)
          return '@'
        return 'vs'
      },

      getOtherTeam(event, team) {
        const homeTeam = event.home_full_name
        const homeLoc = event.home_location
        const homeAbbr = event.home_abbreviation
        const visitingTeam = event.visiting_full_name
        const visitingLoc = event.visiting_location
        const visitingAbbr = event.visiting_abbreviation
        if (homeTeam == team.full_name)
          return visitingAbbr
        return homeAbbr
      },

      getResultOrStyle(event, heroTeam, type="result") {
        const isInPast = moment.utc(event.event_timestamp).isBefore(moment())
        if (!isInPast) {
          if (type == 'result')
            return '0-0'
        }

        const isGameFinal = event.current_period === 'F'

        const homeTeam = event.home_full_name
        const homeTeamScore = event.home_team_score
        const visitingTeam = event.visiting_full_name
        const visitingTeamScore = event.visiting_team_score

        let heroTeamScore, villainTeamScore
        if (homeTeam == heroTeam.full_name) {
          heroTeamScore = homeTeamScore
          villainTeamScore = visitingTeamScore
        } else {
          heroTeamScore = visitingTeamScore
          villainTeamScore = homeTeamScore
        }

        switch (type) {
          case 'style':
            if (isGameFinal)
              return { fontWeight: 'bold', color: (heroTeamScore > villainTeamScore) ? 'green' : 'red' }
            return {}

          default:
            if (isGameFinal) {
              const wOrL = (heroTeamScore > villainTeamScore) ? 'W' : 'L'
              return `${wOrL} ${heroTeamScore}-${villainTeamScore}`
            }
            return `${heroTeamScore}-${villainTeamScore}`
        }
      },

      getTeamColorStyle(team) {
        return { color: `#${team.team_color}` }
      },

      teamSpecificEvents(teamFullName) {
        return this.events.filter(ev => {
          return ev.home_full_name == teamFullName || ev.visiting_full_name == teamFullName
        })
      }
    },

    async created() {
      const info = await CfbData.getAll()
      this.events = info.events
      this.teams = info.teams.sort((t1, t2) => {
        if (t1.location.toLowerCase() < t2.location.toLowerCase())
          return -1
        return 1
      })
    }
  }
</script>

<style scoped>
  .event {
    padding: 2px 2px 0px 2px;
  }

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
    border-bottom: 1px solid #f0f0f0;
    font-size: 8px;
  }

  img {
    max-height: 30px;
  }
</style>
