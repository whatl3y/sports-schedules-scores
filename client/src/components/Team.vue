<template lang="pug">
  div
    div(v-if="isLoading")
      loader
    div(v-if="!isLoading")
      b-col
        small
          a(:href="'/league/' + league") Back to {{ league.toUpperCase() }} Home
      b-container
        div.text-center(:style="{ color: '#' + team.team_color1 }")
          h1.title
            img(style="max-width:100px",:src="'/file/s3/' + team.logo_local_filename")
            span  {{ team.full_name }}
            span(v-if="team.current_ranking")  ({{ team.current_ranking }})
          h5(v-if="teamComplete.standings.short_record") Record: {{ teamComplete.standings.short_record }} ({{ teamComplete.standings.streak }})
        hr
        h1 Schedule
        div.d-flex.justify-content-center.align-items-center
          schedule-large(:league="league",:events="events",:team="team")
</template>

<script>
  import ScheduleLarge from './ScheduleLarge'
  import TimeHelpers from '../factories/TimeHelpers'
  import TeamData from '../factories/TeamData'

  export default {
    props: [ 'league', 'teamid' ],

    data() {
      return {
        isLoading: true,
        events: [],
        team: null
      }
    },

    methods: {
      getTimeFromNow:   TimeHelpers.getTimeFromNow,
      relativeDate:     TimeHelpers.getTimeDifferenceFromUnits,

      getFormattedDate(datetime, format='YYYY-MM-DD h:mm a') {
        return TimeHelpers.getFormattedDate(datetime, format)
      }
    },

    async created() {
      const { events, team } = await TeamData.get(this.teamid, this.league)

      this.events = events
      this.team = team
      this.teamComplete = JSON.parse(this.team.complete_json)

      this.isLoading = false
    },

    components: {
      ScheduleLarge
    }
  }
</script>
