<template lang="pug">
  div.container-fluid
    h1.text-center CFB Schedules and Scores
    div.row
      div.col-12.col-md-6.offset-md-3.col-lg-4.offset-lg-4
        b-form-input(v-model="filter",placeholder="Enter a team name...")
    div.d-flex.flex-row.justify-content-center.flex-wrap
      div.event(v-for="team in filteredTeams")
        b-card
          div.card-text
            div.d-flex.flex-column.align-items-center.justify-content-center
              img.img-fluid(:src="team.logo_url")
              div(style="font-size:8px;") {{ team.full_name }}
</template>

<script>
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
      getFormattedDate: TimeHelpers.getFormattedDate,
      getTimeFromNow:   TimeHelpers.getTimeFromNow,
      relativeDate:     TimeHelpers.getTimeDifferenceFromUnits,

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
    padding: 5px;
  }

  img {
    max-height: 50px;
  }
</style>
