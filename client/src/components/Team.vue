<template lang="pug">
  div
    div(v-if="isLoading")
      loader
    div(v-if="!isLoading")
      div.container(:style="{ color: '#' + team.team_color1 }")
        h1.text-center
          img(style="max-width:80px",:src="'/file/s3/' + team.logo_local_filename")
          span {{ team.full_name }}
        div.text-center(style="margin-top:60px")
          i Team page coming soon...
</template>

<script>
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

      this.isLoading = false
    }
  }
</script>
