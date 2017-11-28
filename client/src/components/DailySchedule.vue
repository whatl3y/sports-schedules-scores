<template lang="pug">
  div
    div(v-if="isLoading")
      loader
    div(v-if="!isLoading")
      b-col
        small
          a(:href="'/league/' + league") Back to {{ league.toUpperCase() }} Home
      b-container
        div.text-center
          h1.title {{ league.toUpperCase() }} Schedule
          h4 for
          div.d-flex.d-column.justify-content-center
            datepicker(v-model="date",@changedWithKey="changeScheduleDate")
        div.d-flex.justify-content-center.align-items-center(v-if="events.length > 0")
          schedule-large(:league="league",:events="events")
        div.row(v-if="events.length === 0")
          b-alert.text-center.col-8.offset-2(variant="warning",:show="true")
            i There are no events that we found {{ getTimeFromNow(date) }}. Select another date above.
</template>

<script>
  import moment from 'moment'
  import Datepicker from './Datepicker'
  import ScheduleLarge from './ScheduleLarge'
  import TimeHelpers from '../factories/TimeHelpers'
  import ApiData from '../factories/ApiData'

  export default {
    props: [ '0', 'league' ],

    data() {
      return {
        isLoading: true,
        events: [],
        date: this.getFormattedDate(new Date(), 'YYYYMMDD')
      }
    },

    methods: {
      getTimeFromNow(date) {
        const daysAgo = moment().diff(date, 'days')
        if (daysAgo >= 0)
          return `${daysAgo} days ago`
        if (daysAgo < 0)
          return `${daysAgo*-1} days from now`
        return 'on this date'
      },

      getFormattedDate(datetime, format='YYYY-MM-DD h:mm a') {
        return TimeHelpers.getFormattedDate(datetime, format)
      },

      async getEvents() {
        const { events } = await ApiData.getAllByDate(this.league, this.getFormattedDate(this.date, 'YYYYMMDD'))
        this.events = events
      },

      async changeScheduleDate(newDate) {
        this.isLoading = true
        this.date = moment.utc(newDate).format('YYYYMMDD')
        await this.getEvents()
        this.isLoading = false
      }
    },

    async created() {
      this.date = (this['0']) ? this['0'].slice(1) : this.date
      await this.getEvents()
      this.isLoading = false
    },

    components: {
      Datepicker,
      ScheduleLarge
    }
  }
</script>
