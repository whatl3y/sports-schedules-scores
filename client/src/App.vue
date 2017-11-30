<template lang="pug">
  div#app
    league-header(:leagues="leagues")
    router-view
    vue-toastr(ref="toastr")
</template>

<script>
  import LeagueHeader from './components/LeagueHeader'
  import ApiData from './factories/ApiData'

  export default {
    name: 'Sports',

    data() {
      return {
        leagues: []
      }
    },

    mounted() {
      this.$root.$refs = Object.assign(this.$root.$refs, {toastr: this.$refs.toastr})
      this.$refs.toastr.defaultPosition = "toast-bottom-right"
    },

    async created() {
      const { leagues } = await ApiData.getLeagues()
      this.leagues = leagues.sort((l1, l2) => {
        if (l1.uri_name.toLowerCase() < l2.uri_name.toLowerCase())
          return -1
        return 1
      })
    },

    components: {
      LeagueHeader
    }
  }
</script>
