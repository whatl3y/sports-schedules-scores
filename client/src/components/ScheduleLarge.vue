<template lang="pug">
  b-table(:striped="true",:hover="true",responsive="md",:fields="scheduleFields",:items="scheduleData")
    template(slot="visiting_team",scope="data")
      a(:href="'/team/' + league + '/' + data.value.uid")
        div.d-flex.d-row.align-items-center
          img.inline-img(:src="'/file/s3/' + data.value.logo")
          div {{ data.value.name }}
    template(slot="home_team",scope="data")
      a(:href="'/team/' + league + '/' + data.value.uid")
        div.d-flex.d-row.align-items-center
          img.inline-img(:src="'/file/s3/' + data.value.logo")
          div {{ data.value.name }}
    template(slot="result",scope="data")
      div(:style="(data.value.indexOf('W') == 0) ? { color: 'green' } : ((data.value.indexOf('L') == 0) ? { color: 'red' } : {})") {{ data.value }}
</template>

<script>
  import moment from 'moment'
  import TimeHelpers from '../factories/TimeHelpers'
  import Snackbar from '../factories/Snackbar'
  import ApiData from '../factories/ApiData'

  export default {
    props: {
      league: String,
      events: Array,
      team: String
    },

    data() {
      return {
        scheduleFields: [],
        scheduleData: []
      }
    },

    methods: {
      getFormattedDate(datetime, format='YYYY-MM-DD h:mma') {
        return TimeHelpers.getFormattedDate(datetime, format)
      },

      getResultOrStyle(event, heroTeam=null, type="result") {
        const isInPast = moment(event.event_timestamp).isBefore(moment())
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
        if (!heroTeam || homeTeam == heroTeam.full_name) {
          heroTeamScore = homeTeamScore
          villainTeamScore = visitingTeamScore
        } else {
          heroTeamScore = visitingTeamScore
          villainTeamScore = homeTeamScore
        }

        switch (type) {
          case 'style':
            if (!heroTeam) return {}
            if (isGameFinal) return { fontWeight: 'bold', color: (heroTeamScore > villainTeamScore) ? 'green' : 'red' }
            if (isPlaying) return { fontWeight: 'bold', color: 'orange' }
            if (isGamePostponed || isGameCancelled) return { textDecoration: 'italic', color: 'gray' }
            return {}

          default:
            if (!heroTeam) return `${(heroTeamScore > villainTeamScore) ? 'H' : 'V'} ${villainTeamScore}-${heroTeamScore}`
            if (isGameFinal) {
              const wOrL = (heroTeamScore > villainTeamScore) ? 'W' : 'L'
              return `${wOrL} ${heroTeamScore}-${villainTeamScore}`
            }
            return `${heroTeamScore}-${villainTeamScore}`
        }
      }
    },

    created() {
      this.scheduleFields = [ 'date', 'event_location', { key: 'visiting_team' }, { key: 'home_team' }, 'spread', 'over_under', { key: 'result' }, 'TV_listings' ]
      this.scheduleData = this.events.map(ev => {
        const tvListings = JSON.parse(ev.tv_listings)
        return {
          date:           this.getFormattedDate(ev.event_timestamp),
          event_location: ev.event_location || 'N/A',
          visiting_team:  { uid: ev.visiting_api_uid, name: ev.visiting_full_name, logo: ev.visiting_local_filename },
          home_team:      { uid: ev.home_api_uid, name: ev.home_full_name, logo: ev.home_local_filename },
          spread:         ev.odds_spread,
          over_under:     ev.odds_over_under,
          result:         this.getResultOrStyle(ev, this.team),
          TV_listings:     (tvListings && tvListings.us) ? tvListings.us.map(n => n.short_name).join(', ') : 'N/A'
        }
      })
    }
  }
</script>

<style scoped>
  .inline-img {
    max-width: 40px;
    max-height: 40px;
    margin: 0px 5px;
  }
</style>
