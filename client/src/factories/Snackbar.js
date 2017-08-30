export default function SnackbarFactory(vueThisRef) {
  return {
    open(message, type='success') {
      const functionTypeMap = {
        success:  's',
        error:    'e'
      }
      return vueThisRef.$root.$refs.toastr[functionTypeMap[type] || 's'](message)
    }
  }
}
