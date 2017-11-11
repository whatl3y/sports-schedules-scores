<template lang="pug">
  div.league-nav(v-if="leagues.length > 0")
    span |&nbsp;
    span(v-for="league in leagues")
      a(:href="'/league/' + league.uri_name",:style="isLeagueActiveClass(league.uri_name)") {{ league.uri_name.toUpperCase() }}
      span  |&nbsp;
</template>

<script>
  import moment from 'moment'
  import Schedule from './Schedule'
  import TimeHelpers from '../factories/TimeHelpers'
  import Snackbar from '../factories/Snackbar'
  import ApiData from '../factories/ApiData'

  export default {
    props: [ 'leagues', 'selected' ],

    methods: {
      isLeagueActiveClass(leagueName) {
        return (leagueName.toLowerCase() == (this.selected || '').toLowerCase()) ? { fontWeight: 'bold' } : {}
      }
    }
  }
</script>
