<template lang="pug">
  div
    div(v-if="isLoading")
      loader
    div(v-if="!isLoading")
      div.league-nav(v-if="leagues.length > 0")
        span &nbsp;|&nbsp;
        span(v-for="league in leagues")
          a(:href="'/' + league.uri_name",:style="isLeagueActiveClass(league.uri_name)") {{ league.uri_name.toUpperCase() }}
          span &nbsp;|&nbsp;
      div.container-fluid
        h1 {{ selectedLeagueName.toUpperCase() }} Schedules and Scores
        div.row
          div.col-12.col-md-8.offset-md-2.col-lg-6.offset-lg-3
            div.row
              div.col-sm-12.col-md-6.margin-bottom-small
                b-form-select(v-model="selectFilter",:options="selectFilterOptions")
              div.col-sm-12.col-md-6
                b-form-input(v-model="searchFilter",placeholder="Search for a team...")
        hr(style="margin:20px 0px;")
        div.d-flex.flex-row.justify-content-center.flex-wrap
          div.event(:style="getTeamColorStyle(team)",v-for="(team, index) in filteredTeams",:id="'event' + index")
            b-card(no-body,:style="{ borderColor: getTeamColorStyle(team, true) }")
              div.card-text.team
                div.d-flex.flex-column.align-items-center.justify-content-center
                  div.text-center(style="font-size:9px;")
                    strong
                      div {{ (team.current_ranking) ? '(' + team.current_ranking + ')' : '' }} {{ team.full_name }}
                  img.img-fluid(:src="'file/s3/' + team.logo_local_filename")
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
  import ApiData from '../factories/ApiData'

  export default {
    props: [ 'league' ],

    data() {
      return {
        isLoading: true,
        selectFilterOptions: [],
        selectFilter: null,
        searchFilter: null,
        selectedLeagueName: this.league,
        leagues: [],
        teams: [],
        events: []
      }
    },

    computed: {
      filteredTeams() {
        let filteredTeams = this.teams.slice(0)
        if (this.selectFilter != 'all') {
          if (this.selectFilter == 'today') {
            filteredTeams = filteredTeams.filter(t => !!t.event_time_today)
            if (filteredTeams.length === 0) {
              this.selectFilter = 'all'
              filteredTeams = this.teams.slice(0)
            }
          } else {
            filteredTeams = filteredTeams.filter(t => this.selectFilter == t.conference_abbreviation)
          }
        }

        if (this.searchFilter)
          return filteredTeams.filter(t => t.full_name.toLowerCase().indexOf(this.searchFilter.toLowerCase()) > -1)
        return filteredTeams
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

      isLeagueActiveClass(leagueName) {
        return (leagueName.toLowerCase() == this.selectedLeagueName.toLowerCase()) ? { fontWeight: 'bold' } : {}
      },

      getAtOrVs(event, team) {
        const homeTeam = event.home_full_name
        const visitingTeam = event.visiting_full_name
        if (homeTeam == team.full_name)
          return 'vs'
        return '@'
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

        const isGameFinal     = event.event_status === 'final'
        const isGamePostponed = event.event_status === 'postponed'
        const isGameCancelled = event.event_status === 'cancelled'
        const isPlaying       = event.event_status === 'progress'

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
            if (isGameFinal) return { fontWeight: 'bold', color: (heroTeamScore > villainTeamScore) ? 'green' : 'red' }
            if (isPlaying) return { fontWeight: 'bold', color: 'orange' }
            if (isGamePostponed || isGameCancelled) return { textDecoration: 'italic', color: 'gray' }
            return {}

          default:
            if (isGameFinal) {
              const wOrL = (heroTeamScore > villainTeamScore) ? 'W' : 'L'
              return `${wOrL} ${heroTeamScore}-${villainTeamScore}`
            }
            return `${heroTeamScore}-${villainTeamScore}`
        }
      },

      getTeamColorStyle(team, justColor=false) {
        if (justColor)
          return `#${team.team_color1}`
        return { color: `#${team.team_color1}` }
      },

      teamSpecificEvents(teamFullName) {
        return this.events.filter(ev => {
          return ev.home_full_name == teamFullName || ev.visiting_full_name == teamFullName
        })
      }
    },

    async created() {
      this.selectedLeagueName = this.selectedLeagueName || 'ncaaf'

      const info = await ApiData.getAll(this.selectedLeagueName)
      this.leagues = info.leagues.sort()
      this.events = info.events
      this.teams = info.teams.sort((t1, t2) => {
        if (t1.location.toLowerCase() < t2.location.toLowerCase())
          return -1
        return 1
      })
      this.conferences = info.conferences || []

      this.selectFilterOptions = [
        { text: `All Teams`, value: 'all' },
        { text: `All Teams with Games Today`, value: 'today' }
      ]
      .concat(this.conferences.map(c => ({ text: `${c} (conference)`, value: c })))
      .filter(c => !!c.value)

      this.selectFilter = (this.conferences.length > 0) ? this.conferences[ Math.floor(Math.random() * this.conferences.length) ] : 'all'
      this.isLoading = false
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
    /*border-bottom: 1px solid #f0f0f0;*/
    font-size: 8px;
  }

  img {
    max-height: 30px;
  }
</style>
