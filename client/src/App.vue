<template lang="pug">
  div#app
    router-view
    vue-toastr(ref="toastr")
</template>

<script>
export default {
  name: 'CFB',
  mounted() {
    this.$root.$refs = Object.assign(this.$root.$refs, {toastr: this.$refs.toastr})
    this.$refs.toastr.defaultPosition = "toast-bottom-right"
  }
}
</script>
